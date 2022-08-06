import type { FieldValue } from "@firebase/firestore"
import { deleteField } from "@firebase/firestore"
import mitt from "mitt"
import { dirname, join, relative } from "path-browserify"
import sort from "sort-array"
import { reactive, ref } from "vue"

import { addDiff } from "./utils/addDiff"
import { decodeObject, encodeObject, encodePath } from "./utils/coder"
import { compiler } from "./utils/compiler"
import {
  CHAR_KEEP,
  KEY_ACTION,
  KEY_DIFF_DIFF_MIXED,
  KEY_DIFF_OBJECT_MIXED,
  KEY_OLD_VALUE
} from "./utils/const"
import { isDiffMixed } from "./utils/isDiffMixed"
import { isDiffObject } from "./utils/isDiffObject"
import { isDirectory } from "./utils/isDirectory"
import { queryObject } from "./utils/queryObject"
import { readFiles } from "./utils/readFiles"
import type {
  Diff,
  DiffMixed,
  DiffObject,
  Directory,
  File
} from "./utils/types"

function flatDiff([diff, name]: [Diff, string]) {
  if (name === undefined) return diff

  return diff[name]
}

export class InMemoryFS {
  protected readonly memory: Directory = {
    [CHAR_KEEP]: ""
  }

  public readonly objectURLMap = reactive(new Map<string, string>())

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
  }

  resetChangelog() {
    for (const name in this.changelog) {
      delete this.changelog[name]
    }
  }

  private async refreshObjectURLFromFile(
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
      this.objectURLMap.set(
        path,
        URL.createObjectURL(
          new Blob([await compiler(content, path)], {
            type: "application/javascript"
          })
        )
      )
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
    return queryObject(this.memory, path.split("/"), "FILE_NOT_EXISTS: ", true)
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

  async mkdir(
    path: string,
    options?: {
      recursive?: boolean
    }
  ) {
    const [pathsSplitted, name] = this.splitPaths(path)

    const parent = queryObject(
      this.memory,
      pathsSplitted,
      "DIR_NOT_EXISTS: ",
      false,
      options?.recursive
    )
    const has = name ? parent[name] : parent

    if (has !== undefined) {
      if (isDirectory(has) && options?.recursive) return
      // if (options?.recursive) return
      // eslint-disable-next-line functional/no-throw-statement
      throw new Error((isDirectory(has) ? "IS_DIR: " : "IS_FILE: ") + path)
    }
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
    const obj = queryObject(this.memory, path.split("/"), "PATH_NOT_EXISTS: ")

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
        queryObject(this.memory, path.split("/"), "DIR_NOT_EXISTS: ", false)
      ).filter((name) => name !== CHAR_KEEP)
    )
  }

  async exists(path: string) {
    try {
      return !!queryObject(this.memory, path.split("/"), "")
    } catch {
      return false
    }
  }

  async readFiles() {
    return readFiles("", this.memory)
  }

  async restore(
    filepath: string,
    diff: Diff | DiffMixed | DiffObject = flatDiff(this.getChangeTree(filepath))
  ) {
    if (isDiffObject(diff)) {
      switch (diff[KEY_ACTION]) {
        case "ADDED":
          await this.unlink(filepath).catch((err) => {
            console.error(err)
          })
          break
        case "MODIFIED":
        case "DELETED":
          await this.mkdir(dirname(filepath), {
            recursive: true
          })
          await this.writeFile(filepath, diff[KEY_OLD_VALUE] as string)
          break
      }

      return
    }
    if (isDiffMixed(diff)) {
      await this.unlink(filepath)

      const obj = diff[KEY_DIFF_OBJECT_MIXED]

      if (isDiffObject(obj)) {
        await this.mkdir(dirname(filepath), {
          recursive: true
        })
        await this.writeFile(filepath, obj[KEY_OLD_VALUE] as string)
      } else {
        for (const name in obj) {
          await this.restore(filepath + "/" + name, obj[name])
        }
      }

      return
    }

    // for ......
    // diff is Diff
    for (const name in diff) {
      await this.restore(filepath + "/" + name, diff[name])
    }
  }

  async commit(
    filepath: string,
    diff: Diff | DiffMixed | DiffObject = flatDiff(
      this.getChangeTree(filepath)
    ),
    treeUpdate: Record<string, string | FieldValue> = {},
    cwd = "/",
    encodeUri = true
  ) {
    const absolutePath = join(cwd, filepath)
    const uid = encodeUri
      ? encodePath(relative("/", absolutePath)).replaceAll("/", ".")
      : relative("/", absolutePath)

    if (isDiffObject(diff)) {
      switch (diff[KEY_ACTION]) {
        case "ADDED":
        case "MODIFIED":
          // add ok?
          treeUpdate[uid] = await this.readFile(absolutePath) // in diff not found
          break
        case "DELETED":
          treeUpdate[uid] = deleteField()
          // delete ok
          break
      }

      return
    }
    if (isDiffMixed(diff)) {
      const obj = diff[KEY_DIFF_DIFF_MIXED]

      if (isDiffObject(obj)) {
        // obj[ KEY_ACTION ] never is "ADDED"
        switch (obj[KEY_ACTION]) {
          case "DELETED":
          case "MODIFIED":
            treeUpdate[uid] = obj[KEY_OLD_VALUE] as string
            break
          case "ADDED":
            treeUpdate[uid] = await this.readFile(absolutePath) // in diff not found
            break
        }
      } else {
        for (const name in obj) {
          await this.commit(
            name,
            obj[name],
            treeUpdate,
            absolutePath,
            encodeUri
          )
        }
      }

      return
    }

    // for ......
    // diff is

    for (const name in diff) {
      await this.commit(name, diff[name], treeUpdate, absolutePath, encodeUri)
    }

    // zero

    // return this.batch?.commit()
    return treeUpdate
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

//   await fs.writeFile("/test.txt", "hello world 2")

//   console.log(await fs.commit("/"))

//   return console.log(fs)
// }
