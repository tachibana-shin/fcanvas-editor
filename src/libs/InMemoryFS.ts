import type { FirebaseApp } from "@firebase/app"
import { getAuth } from "@firebase/auth"
import type {
  DocumentData,
  DocumentReference,
  WriteBatch
} from "@firebase/firestore"
import { deleteField, doc, getFirestore, writeBatch } from "@firebase/firestore"
import { KEY_ACTION, KEY_VALUEA, KEY_VALUEB } from "@tachibana-shin/diff-object"
import mitt from "mitt"
import sort from "sort-array"
import { reactive, ref } from "vue"

import { CHAR_KEEP } from "./utils/CHAR_KEEP"
import { addDiff, DIFF_DIFF_MIXED, DIFF_OBJECT_MIXED } from "./utils/addDiff"
import { decodeObject, encodeObject, encodePath } from "./utils/coder"
import { isDiffMixed } from "./utils/isDiffMixed"
import { isDiffObject } from "./utils/isDiffObject"
import { isDirectory } from "./utils/isDirectory"
import { markDiff } from "./utils/markDiff"
import { queryObject } from "./utils/queryObject"
import { readFiles } from "./utils/readFiles"
import type { Diff, Directory, File } from "./utils/types"

export class InMemoryFS {
  protected readonly memory: Directory = {
    [CHAR_KEEP]: ""
  }

  public readonly changelog: Diff = reactive({})
  public changelogLength = ref(0)

  public readonly events = mitt<{
    write: string
    unlink: string
    mkdir: string
  }>()

  private getParentPaths(paths: string[]) {
    return paths.slice(0, -1)
  }

  private getFilename(pathsSplited: string[]) {
    return pathsSplited[pathsSplited.length - 1]
  }

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
    let prev: Diff | null = this.changelog
    paths.forEach((cur) => {
      if (cur === "") return

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, functional/no-let
      let curObj = prev![cur]

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (isDiffObject(prev![cur])) {
        const diffChild = {}
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        prev![cur] = curObj = {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          [DIFF_OBJECT_MIXED]: prev![cur],
          [DIFF_DIFF_MIXED]: diffChild
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        prev![cur] = curObj = {}
      }

      if (isDiffMixed(curObj)) prev = curObj[DIFF_DIFF_MIXED]
      else prev = curObj
    }, this.changelog)

    return [prev, name]
  }

  clean() {
    for (const name in this.memory)
      if (name !== CHAR_KEEP) delete this.memory[name]

    delete this.batch
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
    const pathsSplited = this.normalize(path).split("/")
    const name = this.getFilename(pathsSplited)

    const dir = queryObject(
      this.memory,
      this.getParentPaths(pathsSplited),
      "DIR_NOT_EXISTS: ",
      false
    )

    if (name in dir && isDirectory(dir[name]))
      // eslint-disable-next-line functional/no-throw-statement
      throw new Error("IS_DIR: " + path)

    // save to change
    {
      const [parent, name] = this.getChangeTree(path)

      if (
        addDiff(parent, name, {
          [KEY_ACTION]: dir[name] !== undefined ? "MODIFIED" : "ADDED",
          [KEY_VALUEA]: dir[name] as File,
          [KEY_VALUEB]: content
        })
      )
        this.changelogLength.value++
    }

    dir[name] = content

    this.events.emit("write", path)
  }

  async mkdir(path: string) {
    const pathsSplited = this.normalize(path).split("/")
    const name = this.getFilename(pathsSplited)

    const parent = queryObject(
      this.memory,
      this.getParentPaths(pathsSplited),
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
    const pathsSplitedFrom = this.normalize(from).split("/")
    const nameFrom = this.getFilename(pathsSplitedFrom)
    const parentFrom = queryObject(
      this.memory,
      this.getParentPaths(pathsSplitedFrom),
      "DIR_NOT_EXISTS: ",
      false
    )

    const obj = parentFrom[nameFrom]

    const pathsSplitedTo = this.normalize(to).split("/")
    const nameTo = this.getFilename(pathsSplitedTo)
    const parentTo = queryObject(
      this.memory,
      this.getParentPaths(pathsSplitedFrom),
      "DIR_NOT_EXISTS: ",
      false
    )

    if (obj === undefined)
      // eslint-disable-next-line functional/no-throw-statement
      throw new Error("PATH_NOT_EXISTS: " + from)
    if (parentTo[nameTo])
      // eslint-disable-next-line functional/no-throw-statement
      throw new Error(
        `TO_IS_${isDirectory(parentTo[nameTo]) ? "DIR" : "FILE"}_EXISTS: ` + to
      )

    const isFile = !isDirectory(obj)
    // save to changelog
    {
      const [parent, name] = this.getChangeTree(from)

      if (isFile) {
        if (
          addDiff(parent, name, {
            [KEY_ACTION]: "DELETED",
            [KEY_VALUEA]: obj,
            [KEY_VALUEB]: undefined
          })
        )
          this.changelogLength.value++
      } else {
        const { diffs, count } = markDiff(obj, true)

        if (addDiff(parent, name, diffs)) this.changelogLength.value += count
      }
    }

    delete parentFrom[nameFrom]
    this.events.emit("unlink", from)

    // save to changelog
    {
      const [parent, name] = this.getChangeTree(to)

      if (isFile) {
        if (
          addDiff(parent, name, {
            [KEY_ACTION]: "ADDED",
            [KEY_VALUEA]: undefined,
            [KEY_VALUEB]: obj
          })
        )
          this.changelogLength.value++
      } else {
        const { diffs, count } = markDiff(obj)

        if (addDiff(parent, name, diffs)) this.changelogLength.value += count
      }
    }

    parentTo[nameTo] = obj
    this.events.emit("write", to)
  }

  async unlink(path: string) {
    const pathsSplited = this.normalize(path).split("/")
    const name = this.getFilename(pathsSplited)
    const parent = queryObject(
      this.memory,
      this.getParentPaths(pathsSplited),
      "DIR_NOT_EXISTS: ",
      false
    )

    const obj = parent[name]

    // eslint-disable-next-line functional/no-throw-statement
    if (obj === undefined) throw new Error("PATH_NOT_EXISTS: " + path)

    // save to changelog
    {
      const [parent, name] = this.getChangeTree(path)

      if (isDirectory(obj)) {
        const { diffs, count } = markDiff(obj, true)

        if (addDiff(parent, name, diffs)) this.changelogLength.value += count
      } else {
        if (
          addDiff(parent, name, {
            [KEY_ACTION]: "DELETED",
            [KEY_VALUEA]: obj,
            [KEY_VALUEB]: undefined
          })
        )
          this.changelogLength.value++
      }
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

  get root() {
    return this.memory
  }

  // bactch
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
  }
}
