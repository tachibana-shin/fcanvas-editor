import mitt from "mitt"

import { InMemoryFS } from "~/libs/InMemoryFS"

export const fs = new InMemoryFS()

if (import.meta.env.NODE_ENV !== "production") {
  // eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
  ;(window as unknown as any).fs = fs
}

export type FS = typeof fs

// readFile, writeFile, rename, unlink, mkdir, lstat, readdir
export const events = mitt<{
  writeFile: string
  unlink: string
}>()

const { writeFile, rename, unlink } = fs

// eslint-disable-next-line functional/immutable-data
fs.writeFile = (path, data) => {
  events.emit("writeFile", path)

  return writeFile.call(fs, path, data)
}
// eslint-disable-next-line functional/immutable-data
fs.rename = (oldPath, newPath) => {
  events.emit("writeFile", newPath)
  events.emit("unlink", oldPath)

  return rename.call(fs, oldPath, newPath)
}
// eslint-disable-next-line functional/immutable-data
fs.unlink = (path) => {
  events.emit("unlink", path)

  return unlink.call(fs, path)
}
