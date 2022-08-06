import { dirname, join, resolve } from "path-browserify"

export function resolvePath(
  filesource: string,
  path: string
): string {
  if (path.startsWith("./") || path.startsWith("../") || path.startsWith("/")) {
    const filepath = join("~/", resolve(dirname(filesource), path))
    // resolve

    return filepath ?? path
  } else {
    // not resolve beause is library. (ex: react, vue, fcanvas) or https://unpkg.com/

    return path
  }
}
