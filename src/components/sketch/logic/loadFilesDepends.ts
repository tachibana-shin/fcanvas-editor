import type { Monaco } from "@monaco-editor/react"
import { Uri } from "monaco-editor"
import { dirname } from "path-browserify"

import { fs } from "~/modules/fs"

function getAllImport(code: string) {
  return code
    .split("\n")
    .filter((line) => line.startsWith("import "))
    .map((line) => {
      // eslint-disable-next-line no-eval
      return eval(line.split("from")[1].trim()) as string
    })
    .filter((path) => path.startsWith("."))
}

export function loadFilesDepends(
  monaco: Monaco,
  currentFile: string,
  content: string
) {
  // content
  getAllImport(content).forEach(async (cpath) => {
    const path = `${dirname(currentFile)}/${cpath}.ts`

    monaco.editor.createModel(
      (await fs.readFile(path)) as string,
      undefined,
      Uri.file(path)
    )
  })
}
