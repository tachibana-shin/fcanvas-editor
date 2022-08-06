import { join } from "path-browserify"
import { InMemoryFS } from "src/libs/InMemoryFS"

export const fs = new InMemoryFS()

if (import.meta.env.NODE_ENV !== "production") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as unknown as any).fs = fs
}

export type FS = typeof fs

export function isPathChange(parent: string, filepath: string) {
  parent = join("/", parent)
  filepath = join("/", filepath)
  return (
    filepath === parent || filepath.startsWith(`${parent}/`) || parent === "/"
  )
}

export function watchFile(
  filepath: string,
  cb: (exists: boolean) => void,
  options?: {
    immediate?: boolean
  }
) {
  const handlerWrite = (file: string) => {
    // eslint-disable-next-line n/no-callback-literal
    if (isPathChange(file, filepath)) cb(true)
  }
  const handlerUnlink = (file: string) => {
    // eslint-disable-next-line n/no-callback-literal
    if (isPathChange(file, filepath)) cb(false)
  }

  if (options?.immediate) {
    // eslint-disable-next-line promise/catch-or-return, promise/no-callback-in-promise
    fs.exists(filepath).then(cb)
  }

  fs.events.on("write", handlerWrite)
  fs.events.on("unlink", handlerUnlink)
  return () => {
    fs.events.off("write", handlerWrite)
    fs.events.off("unlink", handlerUnlink)
  }
}

export function watchDir(dirPath: string, cb: (exists: boolean) => void) {
  const handlerWrite = (file: string) => {
    // eslint-disable-next-line n/no-callback-literal
    if (isPathChange(dirPath, file)) cb(true)
  }
  const handlerUnlink = (file: string) => {
    // eslint-disable-next-line n/no-callback-literal
    if (isPathChange(dirPath, file)) cb(false)
  }

  fs.events.on("write", handlerWrite)
  fs.events.on("unlink", handlerUnlink)
  return () => {
    fs.events.off("write", handlerWrite)
    fs.events.off("unlink", handlerUnlink)
  }
}
