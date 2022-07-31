import { isDirectory } from "./isDirectory"
import type { Directory, File } from "./types"

function queryObject(
  memory: Directory,
  pathsSplitted: string[],
  message: string,
  queryFile: true
): File

function queryObject(
  memory: Directory,
  pathsSplitted: string[],
  message: string,
  queryFile: false
): Directory

function queryObject(
  memory: Directory,
  pathsSplitted: string[],
  message: string
): File | Directory
function queryObject(
  memory: Directory,
  pathsSplitted: string[],
  message: string,
  queryFile?: boolean
): string | Directory {
  const paths = pathsSplitted.slice(0, -1)
  const filename = pathsSplitted[pathsSplitted.length - 1]
  // eslint-disable-next-line functional/no-let
  for (let i = 0; i < paths.length; i++) {
    const name = paths[i]

    if (name === "") continue

    const tmemory = memory[name]

    if (!isDirectory(tmemory))
      // eslint-disable-next-line functional/no-throw-statement
      throw new Error(message + pathsSplitted.join("/"))

    memory = tmemory
  }

  const obj = !filename ? memory : memory[filename]

  // eslint-disable-next-line functional/no-throw-statement
  if (obj === undefined) throw new Error(message + pathsSplitted.join("/"))

  if (queryFile === undefined) return obj

  if (isDirectory(obj) ? queryFile : !queryFile)
    // eslint-disable-next-line functional/no-throw-statement
    throw new Error(message + pathsSplitted.join("/"))

  return obj
}

export { queryObject }
