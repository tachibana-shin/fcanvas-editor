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
  queryFile: false,
  recursive?: boolean
): Directory

function queryObject(
  memory: Directory,
  pathsSplitted: string[],
  message: string,
  queryFile?: boolean
): File | Directory
function queryObject(
  memory: Directory,
  pathsSplitted: string[],
  message: string,
  queryFile?: boolean,
  recursive?: boolean
): string | Directory {
  const paths = pathsSplitted.slice(0, -1)
  const filename = pathsSplitted[pathsSplitted.length - 1]
  // eslint-disable-next-line functional/no-let
  for (let i = 0; i < paths.length; i++) {
    const name = paths[i]

    if (name === "") continue

    const tmemory = memory[name]

    if (!isDirectory(tmemory))
      if (recursive) {
        memory = memory[name] = {}
        continue
      } else {
        // eslint-disable-next-line functional/no-throw-statement
        throw new Error(message + pathsSplitted.join("/"))
      }

    memory = tmemory
  }

  if (filename && recursive && !memory[filename]) memory[filename] = {}

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
