import sort from "sort-array"

interface File {
  name: string
  content: string
}
interface Directory {
  name: string
  childs: (Directory | File)[]
}

function isDirectory(dir: Directory | File): dir is Directory {
  return "childs" in dir
}

// readdir
export class InMemoryFS {
  private readonly memory: Directory = {
    name: "",
    childs: []
  }

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
  ): File | Directory {
    // eslint-disable-next-line functional/no-let
    let { memory } = this

    const pathsDir = this.getParentPaths(pathsSplited)
    const filename = this.getFilename(pathsSplited)

    // return
    // eslint-disable-next-line functional/no-let
    for (let i = 0; i < pathsDir.length; i++) {
      if (pathsDir[i] === "") continue

      const dir = memory.childs.find((item) => item.name === pathsDir[i])

      if (dir && isDirectory(dir)) memory = dir
      // eslint-disable-next-line functional/no-throw-statement
      else throw new Error(message + pathsSplited.join("/"))
    }

    const obj = !filename
      ? memory
      : memory.childs.find((item) => item.name === filename)

    if (obj) {
      if (queryFile === undefined) return obj

      if (isDirectory(obj) ? queryFile : !queryFile)
        // eslint-disable-next-line functional/no-throw-statement
        throw new Error(message + pathsSplited.join("/"))

      return obj
    }
    // eslint-disable-next-line functional/no-throw-statement
    throw new Error(message + pathsSplited.join("/"))
  }

  private getParentPaths(paths: string[]) {
    return paths.slice(0, -1)
  }

  private getFilename(pathsSplited: string[]) {
    return pathsSplited[pathsSplited.length - 1]
  }

  private sortFilesDir(dir: Directory) {
    // eslint-disable-next-line functional/immutable-data
    dir.childs = sort(dir.childs, {
      by: "name"
    })
  }

  private normalize(path: string) {
    return path.replace(/\/+$/g, "")
  }

  clean() {
    // eslint-disable-next-line functional/immutable-data
    this.memory.childs = []
  }

  readFile(path: string) {
    return this.queryObject(
      this.normalize(path).split("/"),
      "FILE_NOT_EXISTS: ",
      true
    ).content
  }

  writeFile(path: string, content: string) {
    const pathsSplited = this.normalize(path).split("/")
    const filename = this.getFilename(pathsSplited)

    const dir = this.queryObject(
      this.getParentPaths(pathsSplited),
      "DIR_NOT_EXISTS: ",
      false
    )

    const inMemory = dir.childs.find((item) => item.name === filename) as File
    if (inMemory) {
      // eslint-disable-next-line functional/no-throw-statement
      if (isDirectory(inMemory)) throw new Error("IS_DIR: " + path)
      // eslint-disable-next-line functional/immutable-data
      inMemory.content = content

      return
    }

    dir.childs.push({
      name: filename,
      content
    })

    this.sortFilesDir(dir)
  }

  mkdir(path: string) {
    const pathsSplited = this.normalize(path).split("/")
    const filename = this.getFilename(pathsSplited)

    const parent = this.queryObject(
      this.getParentPaths(pathsSplited),
      "DIR_NOT_EXISTS: ",
      false
    )

    const has = parent.childs.find((item) => item.name === filename)
    if (has) {
      // eslint-disable-next-line functional/no-throw-statement
      if (isDirectory(has)) throw new Error("IS_DIR: " + path)
      // eslint-disable-next-line functional/no-throw-statement
      else throw new Error("IS_FILE: " + path)
    }

    parent.childs.push({
      name: filename,
      childs: []
    })

    this.sortFilesDir(parent)
  }

  rename(from: string, to: string) {
    const pathsSplitedFrom = this.normalize(from).split("/")
    const filenameFrom = this.getFilename(pathsSplitedFrom)
    const parentFrom = this.queryObject(
      this.getParentPaths(pathsSplitedFrom),
      "DIR_NOT_EXISTS: ",
      false
    )

    const obj = parentFrom.childs.find((item) => item.name === filenameFrom)

    // eslint-disable-next-line functional/no-throw-statement
    if (!obj) throw new Error("PATH_NOT_EXISTS: " + from)
    // remove
    // eslint-disable-next-line functional/immutable-data
    parentFrom.childs = parentFrom.childs.filter(
      (item) => item.name !== filenameFrom
    )

    const pathsSplitedTo = this.normalize(to).split("/")
    const filenameTo = this.getFilename(pathsSplitedTo)
    const parentTo = this.queryObject(
      this.getParentPaths(pathsSplitedFrom),
      "DIR_NOT_EXISTS: ",
      false
    )

    parentTo.childs.push({
      ...obj,
      name: filenameTo
    })

    this.sortFilesDir(parentTo)
  }

  unlink(path: string) {
    const pathsSplited = this.normalize(path).split("/")
    const filename = this.getFilename(pathsSplited)
    const parent = this.queryObject(
      this.getParentPaths(pathsSplited),
      "DIR_NOT_EXISTS: ",
      false
    )

    const index = parent.childs.findIndex((item) => item.name === filename)

    // eslint-disable-next-line functional/no-throw-statement
    if (index === -1) throw new Error("PATH_NOT_EXISTS: " + path)

    parent.childs.splice(index, 1)
  }

  lstat(path: string) {
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

  readdir(path: string) {
    return this.queryObject(
      this.normalize(path).split("/"),
      "DIR_NOT_EXISTS: ",
      false
    ).childs.map((item) => item.name)
  }

  exists(path: string) {
    try {
      return !!this.queryObject(this.normalize(path).split("/"), "")
    } catch {
      return false
    }
  }
}
