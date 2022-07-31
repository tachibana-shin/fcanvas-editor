import { isDirectory } from "./isDirectory"
import type { Directory, File } from "./types"

export function encodePath(path: string) {
  return path.replaceAll(".", "#dot")
}
export function decodePath(path: string) {
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
    if (isDirectory(dir)) newObj[coder(name)] = encodeObject(dir)
    else newObj[coder(name)] = dir
  }

  return newObj as T
}

export function encodeObject<T extends Directory | File>(obj: T): T {
  return coding(obj, encodePath)
}
export function decodeObject<T extends Directory | File>(obj: T): T {
  return coding(obj, decodePath)
}
