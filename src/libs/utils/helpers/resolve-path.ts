import { dirname, resolve } from "path-browserify"

import { fs } from "../../../modules/fs"

export async function resolvePath(filesource: string, path: string): Promise<string> {
  if (path.startsWith("./") || path.startsWith("../") || path.startsWith("/")) {
    const filepath = resolve(dirname(filesource), path)
    // resolve

    console.log({ filepath, filesource, path, map: fs.objectURLMap })

    return fs.objectURLMap.get(filepath) ?? path
  } else {
    // not resolve beause is library. (ex: react, vue, fcanvas) or https://unpkg.com/

    return path
  }
}
