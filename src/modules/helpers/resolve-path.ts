import { dirname, resolve } from "path-browserify"

import { fs } from "../fs"

export function resolvePath(filesource: string, path: string): string {
  if (path.startsWith("./") || path.startsWith("../") || path.startsWith("/")) {
    const filepath = resolve(dirname(filesource), path)
    // resolve

    return fs.objectURLMap.get(filepath) ?? path
  } else {
    // not resolve beause is library. (ex: react, vue, fcanvas) or https://unpkg.com/

    return path
  }
}
