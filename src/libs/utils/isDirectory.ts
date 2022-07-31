import type { Directory, File } from "./types"

export function isDirectory(dir: Directory | File): dir is Directory {
  return typeof dir === "object"
}
