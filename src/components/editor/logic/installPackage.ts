import type { Monaco } from "@monaco-editor/react"
import type { editor } from "monaco-editor"
import { v4 } from "uuid"

import { readFileConfig } from "~/helpers/readFileConfig"
import { fs } from "~/modules/fs"
import TypingsWorker from "~/workers/typings?worker"

const typing = new TypingsWorker()
function typings(depends: Record<string, string>) {
  return new Promise<
    {
      text: string
      file: string
    }[]
  >((resolve) => {
    const id = v4()
    const handler = (
      event: MessageEvent<{
        id: string
        types: {
          text: string
          file: string
        }[]
      }>
    ) => {
      if (event.data.id === id) {
        resolve(event.data.types)
        typing.removeEventListener("message", handler)
      }
    }
    typing.addEventListener("message", handler)
    typing.postMessage({
      id,
      depends
    })
  })
}

export async function installPackages(
  _editor: editor.ICodeEditor | editor.IStandaloneCodeEditor,
  monaco: Monaco
) {
  const packageJSON = await readFileConfig(
    fs,
    ["package.json"],
    (_f, content) => JSON.parse(content),
    {}
  )

  const types = await typings(packageJSON.dependencies ?? {})

  types.forEach(({ text, file }) => {
    monaco.languages.typescript.javascriptDefaults.addExtraLib(text, file)
  })
}
