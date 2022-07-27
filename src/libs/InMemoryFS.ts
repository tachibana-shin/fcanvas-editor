import type { FirebaseApp } from "@firebase/app"
import { getAuth } from "@firebase/auth"
import type {
  DocumentData,
  DocumentReference,
  WriteBatch
} from "@firebase/firestore"
import { deleteField, doc, getFirestore, writeBatch } from "@firebase/firestore"
import mitt from "mitt"
import sort from "sort-array"

type File = string

const CHAR_KEEP = "@#"
interface Directory {
  [name: string]: File | Directory
}

function isDirectory(dir: Directory | File): dir is Directory {
  return typeof dir === "object"
}

// readdir
export class InMemoryFS {
  private readonly memory: Directory = {
    [CHAR_KEEP]: ""
  }

  public name?: string
  public id?: string
  public readonly events = mitt<{
    write: string
    unlink: string
    mkdir: string
  }>()

  private queryObject(
    pathsSplited: string[],
    message: string,
    queryFile: true
  ): File
  private queryObject(
    pathsSplited: string[],
    message: string,
    queryFile: false
  ): Directory
  private queryObject(pathsSplited: string[], message: string): File | Directory
  private queryObject(
    pathsSplited: string[],
    message: string,
    queryFile?: boolean
  ): string | Directory {
    // eslint-disable-next-line functional/no-let
    let { memory } = this

    const paths = pathsSplited.slice(0, -1)
    const filename = pathsSplited[pathsSplited.length - 1]
    // eslint-disable-next-line functional/no-let
    for (let i = 0; i < paths.length; i++) {
      const name = paths[i]

      if (name === "") continue

      const tmemory = memory[name]

      if (!isDirectory(tmemory))
        // eslint-disable-next-line functional/no-throw-statement
        throw new Error(message + pathsSplited.join("/"))

      memory = tmemory
    }

    const obj = !filename ? memory : memory[filename]

    // eslint-disable-next-line functional/no-throw-statement
    if (obj === undefined) throw new Error(message + pathsSplited.join("/"))

    if (queryFile === undefined) return obj

    if (isDirectory(obj) ? queryFile : !queryFile)
      // eslint-disable-next-line functional/no-throw-statement
      throw new Error(message + pathsSplited.join("/"))

    return obj
  }

  private getParentPaths(paths: string[]) {
    return paths.slice(0, -1)
  }

  private getFilename(pathsSplited: string[]) {
    return pathsSplited[pathsSplited.length - 1]
  }

  private normalize(path: string) {
    return path.replace(/\/+$/g, "")
  }

  clean() {
    for (const name in this.memory)
      // eslint-disable-next-line functional/immutable-data
      if (name !== CHAR_KEEP) delete this.memory[name]
  }

  async readFile(path: string) {
    return this.queryObject(
      this.normalize(path).split("/"),
      "FILE_NOT_EXISTS: ",
      true
    )
  }

  async writeFile(path: string, content: string) {
    const pathsSplited = this.normalize(path).split("/")
    const name = this.getFilename(pathsSplited)

    const dir = this.queryObject(
      this.getParentPaths(pathsSplited),
      "DIR_NOT_EXISTS: ",
      false
    )

    if (name in dir && isDirectory(dir[name]))
      // eslint-disable-next-line functional/no-throw-statement
      throw new Error("IS_DIR: " + path)

    // eslint-disable-next-line functional/immutable-data
    dir[name] = content

    this.events.emit("write", path)
  }

  async mkdir(path: string) {
    const pathsSplited = this.normalize(path).split("/")
    const name = this.getFilename(pathsSplited)

    const parent = this.queryObject(
      this.getParentPaths(pathsSplited),
      "DIR_NOT_EXISTS: ",
      false
    )

    const has = parent[name]

    if (has !== undefined)
      // eslint-disable-next-line functional/no-throw-statement
      throw new Error((isDirectory(has) ? "IS_DIR: " : "IS_FILE: ") + path)

    // eslint-disable-next-line functional/immutable-data
    parent[name] = {
      [CHAR_KEEP]: ""
    }

    this.events.emit("mkdir", path)
  }

  async rename(from: string, to: string) {
    const pathsSplitedFrom = this.normalize(from).split("/")
    const nameFrom = this.getFilename(pathsSplitedFrom)
    const parentFrom = this.queryObject(
      this.getParentPaths(pathsSplitedFrom),
      "DIR_NOT_EXISTS: ",
      false
    )

    const obj = parentFrom[nameFrom]
    if (obj === undefined)
      // eslint-disable-next-line functional/no-throw-statement
      throw new Error("PATH_NOT_EXISTS: " + from)

    // eslint-disable-next-line functional/immutable-data
    delete parentFrom[nameFrom]
    this.events.emit("unlink", from)

    const pathsSplitedTo = this.normalize(to).split("/")
    const nameTo = this.getFilename(pathsSplitedTo)
    const parentTo = this.queryObject(
      this.getParentPaths(pathsSplitedFrom),
      "DIR_NOT_EXISTS: ",
      false
    )

    // eslint-disable-next-line functional/immutable-data
    parentTo[nameTo] = obj
    this.events.emit("unlink", to)
  }

  async unlink(path: string) {
    const pathsSplited = this.normalize(path).split("/")
    const name = this.getFilename(pathsSplited)
    const parent = this.queryObject(
      this.getParentPaths(pathsSplited),
      "DIR_NOT_EXISTS: ",
      false
    )

    const obj = parent[name]

    // eslint-disable-next-line functional/no-throw-statement
    if (obj === undefined) throw new Error("PATH_NOT_EXISTS: " + path)

    // eslint-disable-next-line functional/immutable-data
    delete parent[name]
    this.events.emit("unlink", path)
  }

  async lstat(path: string) {
    const obj = this.queryObject(
      this.normalize(path).split("/"),
      "PATH_NOT_EXISTS: "
    )

    return {
      isDirectory() {
        return isDirectory(obj)
      },
      isFile() {
        return !isDirectory(obj)
      }
    }
  }

  async readdir(path: string) {
    return sort(
      Object.keys(
        this.queryObject(
          this.normalize(path).split("/"),
          "DIR_NOT_EXISTS: ",
          false
        )
      )
    )
  }

  async exists(path: string) {
    try {
      return !!this.queryObject(this.normalize(path).split("/"), "")
    } catch {
      return false
    }
  }

  get root() {
    return this.memory
  }

  // bactch
  private batch?: WriteBatch
  private sketch?: DocumentReference<DocumentData>

  private onWrite = async (path: string) => {
    if (!this.sketch) return

    const paths = encodePath(path).split("/")

    this.batch?.update(this.sketch, {
      ["fs" + paths.join(".")]: encodeObject(
        await this.queryObject(path.split("/"), "")
      )
    })
  }

  private onUnlink = async (path: string) => {
    if (!this.sketch) return

    const paths = encodePath(path).split("/")

    this.batch?.update(this.sketch, {
      ["fs" + paths.join(".")]: deleteField()
    })
  }

  createbatch(app: FirebaseApp) {
    // this.batch.
    const db = getFirestore(app)
    const auth = getAuth(app)

    if (!auth.currentUser) return
    if (!this.id) return

    this.sketch = doc(db, "users", auth.currentUser.uid, "sketches", this.id)

    this.batch = writeBatch(db)

    this.events.off("write", this.onWrite)
    this.events.off("unlink", this.onUnlink)
    this.events.off("mkdir", this.onWrite)

    this.events.on("write", this.onWrite)
    this.events.on("unlink", this.onUnlink)
    this.events.on("mkdir", this.onWrite)
  }

  commit() {
    return this.batch?.commit()
  }

  toFDBObject(): Directory {
    return encodeObject(this.memory)
  }

  fromFDBObject(object: Directory) {
    this.clean()
    Object.assign(this.memory, decodeObject(object))
  }
}

function encodePath(path: string) {
  return path.replaceAll(".", "#dot")
}
function decodePath(path: string) {
  return path.replaceAll("#dot", ".")
}

function coding<T extends Directory | File>(
  obj: T,
  coder: (v: string) => string
): T {
  if (!isDirectory(obj)) return obj

  const newObj: Directory = {}

  for (const name in obj) {
    const dir = obj[name]
    if (isDirectory(dir))
      // eslint-disable-next-line functional/immutable-data
      newObj[coder(name)] = encodeObject(dir)
    // eslint-disable-next-line functional/immutable-data
    else newObj[coder(name)] = dir
  }

  return newObj as T
}

function encodeObject<T extends Directory | File>(obj: T): T {
  return coding(obj, encodePath)
}
function decodeObject<T extends Directory | File>(obj: T): T {
  return coding(obj, decodePath)
}
