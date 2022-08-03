import type { FirebaseApp } from "@firebase/app"
import { getAuth } from "@firebase/auth"
import type {
  DocumentData,
  DocumentReference,
  WriteBatch
} from "@firebase/firestore"
import { deleteField, doc, getFirestore, writeBatch } from "@firebase/firestore"
import mitt from "mitt"
import { join, relative } from "path-browserify"
import sort from "sort-array"
import { reactive, ref } from "vue"

import { addDiff } from "./utils/addDiff"
import { decodeObject, encodeObject, encodePath } from "./utils/coder"
import {
  KEY_ACTION,
  KEY_DIFF_DIFF_MIXED,
  KEY_DIFF_OBJECT_MIXED,
  CHAR_KEEP
} from "./utils/const"
import { isDiffMixed } from "./utils/isDiffMixed"
import { isDiffObject } from "./utils/isDiffObject"
import { isDirectory } from "./utils/isDirectory"
import { queryObject } from "./utils/queryObject"
import { readFiles } from "./utils/readFiles"
import type { Diff, Directory, File } from "./utils/types"

export class InMemoryFS {
  protected readonly memory: Directory = {
    [CHAR_KEEP]: ""
  }

  public readonly objectURLMap = new Map<string, string>()

  public readonly changelog: Diff = reactive({})
  public changelogLength = ref(0)

  public readonly events = mitt<{
    write: string
    unlink: string
    mkdir: string
  }>()

  private splitPaths(path: string): [string[], string] {
    const paths = path.split("/").filter(Boolean)

    return [paths.slice(0, -1), paths[paths.length - 1]]
  }

  private normalize(path: string) {
    return path.replace(/\/+$/g, "")
  }

  private getChangeTree(path: string): [Diff, string] {
    const [paths, name] = this.splitPaths(path)

    // eslint-disable-next-line functional/no-let
    let prev: Diff = this.changelog
    paths.forEach((cur) => {
      if (cur === "") return

      // eslint-disable-next-line functional/no-let
      let curObj = prev[cur]

      if (curObj === undefined) {
        // eslint-disable-next-line no-return-assign
        return (prev = prev[cur] = {})
      }

      if (isDiffObject(curObj)) {
        if (curObj[KEY_ACTION] === "DELETED") {
          prev[cur] = {
            [KEY_DIFF_OBJECT_MIXED]: prev[cur],
            [KEY_DIFF_DIFF_MIXED]: (curObj = {})
          }

          prev = curObj
          return
        }
        if (import.meta.env.NODE_ENV !== "production") {
          if (curObj[KEY_ACTION] === "MODIFIED") {
            // eslint-disable-next-line functional/no-throw-statement
            throw new Error("This curObj never state is MODIFIED")
          }
        }
        // eslint-disable-next-line no-return-assign
        return (prev = prev[name] = {})
      }

      if (isDiffMixed(curObj)) {
        const inDiff = curObj[KEY_DIFF_DIFF_MIXED]
        if (isDiffObject(inDiff)) {
          prev[name] = curObj = curObj[KEY_DIFF_OBJECT_MIXED] as Diff
        } else {
          curObj = inDiff
        }
      }

      return (prev = curObj)
    }, this.changelog)

    return [prev, name]
  }

  clean() {
    this.refreshObjectURLFromDir("", this.memory, true)
    for (const name in this.memory)
      if (name !== CHAR_KEEP) delete this.memory[name]

    delete this.batch
  }

  resetChangelog() {
    for (const name in this.changelog) {
      delete this.changelog[name]
    }
  }

  private refreshObjectURLFromFile(
    path: string,
    content: string,
    isRevoke: boolean
  ) {
    const inMemory = this.objectURLMap.get(path)
    if (inMemory) {
      URL.revokeObjectURL(inMemory)
      if (isRevoke) this.objectURLMap.delete(path)
    }

    if (!isRevoke)
      this.objectURLMap.set(path, URL.createObjectURL(new Blob([content])))
  }

  private refreshObjectURLFromDir(
    path: string,
    dir: Directory,
    isRevoke: boolean
  ) {
    for (const name in dir) {
      if (name === CHAR_KEEP) continue

      const obj = dir[name]
      if (isDirectory(obj)) {
        this.refreshObjectURLFromDir(path + "/" + name, obj, isRevoke)
      } else {
        this.refreshObjectURLFromFile(path + "/" + name, obj, isRevoke)
      }
    }
  }

  async readFile(path: string) {
    return queryObject(
      this.memory,
      this.normalize(path).split("/"),
      "FILE_NOT_EXISTS: ",
      true
    )
  }

  async writeFile(path: string, content: string) {
    const [pathsSplitted, name] = this.splitPaths(path)

    const dir = queryObject(
      this.memory,
      pathsSplitted,
      "DIR_NOT_EXISTS: ",
      false
    )

    if (name in dir && isDirectory(dir[name]))
      // eslint-disable-next-line functional/no-throw-statement
      throw new Error("IS_DIR: " + path)

    // NOTE: save to change
    {
      const [parent, name] = this.getChangeTree(path)

      this.changelogLength.value += addDiff(
        parent,
        name,
        typeof dir[name] === "string" ? "MODIFIED" : "ADDED",
        dir[name] as File,
        content
      )
    }
    // NOTE: refresh or create object url
    this.refreshObjectURLFromFile(path, content, false)

    dir[name] = content

    this.events.emit("write", path)
  }

  async mkdir(path: string) {
    const [pathsSplitted, name] = this.splitPaths(path)

    const parent = queryObject(
      this.memory,
      pathsSplitted,
      "DIR_NOT_EXISTS: ",
      false
    )

    const has = parent[name]

    if (has !== undefined)
      // eslint-disable-next-line functional/no-throw-statement
      throw new Error((isDirectory(has) ? "IS_DIR: " : "IS_FILE: ") + path)
    // {
    //   const [parent, name] = this.getChangeTree(path)

    //   // eslint-disable-next-line functional/immutable-data
    //   parent[name] = {
    //     [KEY_ACTION]: "ADDED",
    //     [KEY_VALUEA]: undefined,
    //     [KEY_VALUEB]: has
    //   }
    // }

    parent[name] = {
      [CHAR_KEEP]: ""
    }

    this.events.emit("mkdir", path)
  }

  async rename(from: string, to: string) {
    const [pathsSplittedFrom, nameFrom] = this.splitPaths(from)
    const parentFrom = queryObject(
      this.memory,
      pathsSplittedFrom,
      "DIR_NOT_EXISTS: ",
      false
    )

    const objFrom = parentFrom[nameFrom]
    if (objFrom === undefined)
      // eslint-disable-next-line functional/no-throw-statement
      throw new Error("PATH_NOT_EXISTS: " + from)

    const [pathsSplittedTo, nameTo] = this.splitPaths(to)
    const parentTo = queryObject(
      this.memory,
      pathsSplittedTo,
      "DIR_NOT_EXISTS: ",
      false
    )
    if (parentTo[nameTo])
      // eslint-disable-next-line functional/no-throw-statement
      throw new Error(
        `TO_IS_${isDirectory(parentTo[nameTo]) ? "DIR" : "FILE"}_EXISTS: ` + to
      )

    const isFile = !isDirectory(objFrom)
    // NOTE: save to changelog
    {
      const [parent, name] = this.getChangeTree(from)

      if (isFile) {
        this.changelogLength.value += addDiff(parent, name, "DELETED", objFrom)
      } else {
        this.changelogLength.value += addDiff(parent, name, "DELETED", objFrom)
      }
    }

    delete parentFrom[nameFrom]
    this.events.emit("unlink", from)

    // NOTE: save to changelog
    {
      const [parent, name] = this.getChangeTree(to)

      if (isFile) {
        this.changelogLength.value += addDiff(
          parent,
          name,
          "ADDED",
          undefined,
          objFrom
        )
      } else {
        this.changelogLength.value += addDiff(parent, name, "ADDED", objFrom)
      }
    }
    // NOTE: move object url
    // eslint-disable-next-line no-lone-blocks
    {
      // move object url
      if (isFile) {
        const inMemory = this.objectURLMap.get(from)

        this.objectURLMap.delete(from)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.objectURLMap.set(to, inMemory!)
      } else {
        readFiles(from, objFrom).forEach((path) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const inMemory = this.objectURLMap.get(path)!
          this.objectURLMap.delete(path)

          const newPath = join(to, relative(from, path))
          this.objectURLMap.set(newPath, inMemory)
        })
      }
    }

    parentTo[nameTo] = objFrom
    this.events.emit("write", to)
  }

  async unlink(path: string) {
    const [pathsSplitted, name] = this.splitPaths(path)
    const parent = queryObject(
      this.memory,
      pathsSplitted,
      "DIR_NOT_EXISTS: ",
      false
    )

    const obj = parent[name]
    // eslint-disable-next-line functional/no-throw-statement
    if (obj === undefined) throw new Error("PATH_NOT_EXISTS: " + path)

    // NOTE: save to changelog
    {
      const [parent, name] = this.getChangeTree(path)

      if (isDirectory(obj)) {
        this.changelogLength.value += addDiff(parent, name, "DELETED", obj)
      } else {
        this.changelogLength.value += addDiff(parent, name, "DELETED", obj)
      }
    }
    // NOTE: refresh or create object url
    if (isDirectory(obj)) {
      this.refreshObjectURLFromDir(path, obj, true)
    } else {
      this.refreshObjectURLFromFile(path, obj, true)
    }

    delete parent[name]
    this.events.emit("unlink", path)
  }

  async lstat(path: string) {
    const obj = queryObject(
      this.memory,
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
        queryObject(
          this.memory,
          this.normalize(path).split("/"),
          "DIR_NOT_EXISTS: ",
          false
        )
      ).filter((name) => name !== CHAR_KEEP)
    )
  }

  async exists(path: string) {
    try {
      return !!queryObject(this.memory, this.normalize(path).split("/"), "")
    } catch {
      return false
    }
  }

  async readFiles() {
    return readFiles("", this.memory)
  }

  // batch
  private batch?: WriteBatch
  private sketch?: DocumentReference<DocumentData>

  private onWrite = async (path: string) => {
    if (!this.sketch) return
    if (path === "/") return

    const paths = encodePath(path).split("/")

    this.batch?.update(this.sketch, {
      ["fs" + paths.join(".")]: encodeObject(
        await queryObject(this.memory, path.split("/"), "")
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

  createbatch(app: FirebaseApp, id: string) {
    // this.batch.
    const db = getFirestore(app)
    const auth = getAuth(app)

    if (!auth.currentUser) return

    this.sketch = doc(db, "users", auth.currentUser.uid, "sketches", id)

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
    this.events.emit("write", "/")

    this.refreshObjectURLFromDir("", this.memory, false)
  }
}
// import { Blob } from "buffer"
// const fs = new InMemoryFS()

// main()
// async function main() {
//   fs.clean()

//   await fs.writeFile("/test.txt", "hello world")

//   fs.changelog = {}
//   fs.changelogLength.value = 0

//   await fs.unlink("/test.txt")

//   await fs.mkdir("/test.txt")
//   await fs.writeFile("/test.txt/test.bat", "echo hello world")
//   await fs.writeFile("/test.txt/test.bat2", "echo hello world")
// console.clear()
//   await fs.unlink("/test.txt")
//   await fs.writeFile("/test.txt", "hello world")

//   return console.log(fs.changelogLength.value)
//   return console.log(fs.changelogLength.value)
// }
