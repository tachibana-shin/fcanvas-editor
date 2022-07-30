import type { Monaco } from "@monaco-editor/react"
import type { editor, languages as Languages } from "monaco-editor"
import { v4 } from "uuid"

import { readFileConfig } from "src/helpers/readFileConfig"
import { fs, isPathChange } from "src/modules/fs"
import TypingsWorker from "src/workers/typings?worker"

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

const URI_PKG = "/package.json"
// eslint-disable-next-line functional/no-let
let monacoSelf: Monaco
async function loadPackages(path: string) {
  if (isPathChange(path, URI_PKG)) {
    console.log("Loading packages...")
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
      monacoSelf.languages.typescript.javascriptDefaults.addExtraLib(text, file)
      monacoSelf.languages.typescript.typescriptDefaults.addExtraLib(text, file)
      monacoSelf.languages.typescript.javascriptDefaults.addExtraLib(
        pkgText,
        pkgPath
      )
      monacoSelf.languages.typescript.typescriptDefaults.addExtraLib(
        pkgText,
        pkgPath
      )
    })
  }
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
  } as unknown as Languages.typescript.CompilerOptions

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
    compilerOptions
  )
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
    compilerOptions
  )
  monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true)

  monacoSelf = monaco
  fs.events.off("write", loadPackages)
  fs.events.on("write", loadPackages)
  loadPackages("/package.json")
}
