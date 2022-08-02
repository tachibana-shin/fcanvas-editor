import { join } from "path-browserify"

import { CHAR_KEEP } from "./CHAR_KEEP"
import type { Directory } from "./types"

export function readFiles(cwd: string, dir: Directory) {
  const files: string[] = []

  for (const name in dir) {
    if (name === CHAR_KEEP) continue

    if (typeof dir[name] === "object")
      files.push(...readFiles(join(cwd, name), dir[name] as Directory))
    else files.push(join(cwd, name))
  }

  return files
}
