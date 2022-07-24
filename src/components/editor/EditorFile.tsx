import { Icon } from "@iconify/react"
import type { Monaco } from "@monaco-editor/react"
import Editor from "@monaco-editor/react"
import debounce from "debounce"
import { Uri } from "monaco-editor"
import type { editor, languages as Languages } from "monaco-editor"
import { AutoTypings, LocalStorageCache } from "monaco-editor-auto-typings"
import type { useRef } from "react"
import { useEffect, useMemo, useState } from "react"

import { installPackages } from "./logic/installPackage"
import { installFormatter } from "./logic/installPrettier"

import { fs } from "~/modules/fs"
import { useStoreState } from "~/stores"

// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
const PRETTIER_CONFIG_FILES = [
  ".prettierrc",
  ".prettierrc.json",
  ".prettierrc.json5",
  ".prettierrc.yaml",
  ".prettierrc.yml",
  ".prettierrc.toml",
  ".prettierrc.js",
  ".prettierrc.cjs",
  "package.json",
  "prettier.config.js",
  "prettier.config.cjs",
  ".editorconfig"
]

async function initAutoTypes(
  editor: editor.ICodeEditor | editor.IStandaloneCodeEditor,
  monaco: Monaco
) {
  console.log("mounted editor")

  // monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true)
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

  await AutoTypings.create(editor, {
    monaco,
    shareCache: true,
    sourceCache: new LocalStorageCache(), // Cache loaded sources in localStorage. May be omitted
    // Other options...
    fileRootPath: "@types/",
    // Log progress updates to a div console
    onUpdate(_u, t) {
      console.info(t)
    },

    // Log errors to a div console
    onError(e) {
      console.warn(e)
    },

    // Print loaded versions to DOM
    onUpdateVersions(versions) {
      console.info(versions)
    }
  })
}

export function EditorFile(props: {
  editorRef: ReturnType<
    typeof useRef<editor.ICodeEditor | editor.IStandaloneCodeEditor>
  >
}) {
  const { editorRef } = props

  const { currentFile } = useStoreState().editor

  console.log("change current %s", currentFile)
  const [contentFile, setContentFile] = useState("")
  useEffect(() => {
    if (currentFile) {
      console.log("reading %s", currentFile)
      // eslint-disable-next-line promise/catch-or-return, promise/always-return
      fs.readFile(currentFile, "utf8").then((code) => {
        setContentFile(code as string)
        console.log({ code })
      })
    }
  }, [currentFile])

  const autoSave = useMemo(() => {
    if (!currentFile) return undefined

    const file = currentFile
    return debounce(async (code: string | undefined) => {
      if (code === undefined) return

      console.log("auto saving %s", file)

      await fs.writeFile(file, code, "utf8")
    }, 1e3)
  }, [currentFile])

  if (currentFile === null) {
    return (
      <div className="w-full h-full text-center flex items-center justify-center">
        <Icon
          icon="fluent:code-text-edit-20-filled"
          className="w-120px h-120px text-gray-400"
        />
      </div>
    )
  }

  return (
    <Editor
      width="100%"
      options={{
        automaticLayout: true
      }}
      // defaultLanguage={currentFile ? extname(currentFile) : undefined}
      value={contentFile}
      theme="vs-dark"
      path={Uri.file(currentFile).toString()}
      onChange={autoSave}
      onMount={(
        editor: editor.ICodeEditor | editor.IStandaloneCodeEditor,
        monaco: Monaco
      ) => {
        // eslint-disable-next-line functional/immutable-data
        editorRef.current = editor
        initAutoTypes(editor, monaco)
        installFormatter(editor, monaco)
        installPackages(editor, monaco)
        // installESlint(editor, monaco)
      }}
    />
  )
}
