import type { Monaco } from "@monaco-editor/react"
import type { editor, languages as Languages } from "monaco-editor"
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
      pkgText: string
      pkgPath: string
    }[]
  >((resolve) => {
    const id = v4()
    const handler = (
      event: MessageEvent<{
        id: string
        types: {
          text: string
          file: string
          pkgText: string
          pkgPath: string
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
  const compilerOptions = {
    allowJs: true,
    allowSyntheticDefaultImports: true,
    alwaysStrict: true,
    jsx: "React",
    jsxFactory: "React.createElement"
    // moduleResolution: "node"
  } as unknown as Languages.typescript.CompilerOptions

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
    compilerOptions
  )
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
    compilerOptions
  )

  const packageJSON = await readFileConfig(
    fs,
    ["/package.json"],
    (_f, content) => JSON.parse(content),
    {}
  )
  console.log(packageJSON)

  const types = await typings(packageJSON.dependencies ?? {})

  console.log(types)

  types.forEach(({ text, pkgPath, pkgText, file }) => {
    monaco.languages.typescript.javascriptDefaults.addExtraLib(text, file)
    monaco.languages.typescript.typescriptDefaults.addExtraLib(text, file)
    monaco.languages.typescript.javascriptDefaults.addExtraLib(pkgText, pkgPath)
    monaco.languages.typescript.typescriptDefaults.addExtraLib(pkgText, pkgPath)
  })
}
window.typings = typings
