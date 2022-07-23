import "./Index.scss"

import { Icon } from "@iconify/react"
import type { Monaco } from "@monaco-editor/react"
import Editor from "@monaco-editor/react"
import CreateNewFolderOutlined from "@mui/icons-material/CreateNewFolderOutlined"
import NoteAddOutlined from "@mui/icons-material/NoteAddOutlined"
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined"
import type { FuncShared } from "components/editor/FileTree"
import { FileTreeNoRoot } from "components/editor/FileTree"
import { ToolBar } from "components/editor/ToolBar"
import debounce from "debounce"
import type { editor, languages as Languages } from "monaco-editor"
import { Uri } from "monaco-editor"
import { AutoTypings, LocalStorageCache } from "monaco-editor-auto-typings"
import { join } from "path-browserify"
import type { Options } from "prettier"
import { Resizable } from "re-resizable"
import { useEffect, useMemo, useRef, useState } from "react"
import { v4 } from "uuid"

import { fs } from "~/modules/fs"
import { useStoreState } from "~/stores"
import PrettierWorker from "~/workers/prettier?worker"

const languages = [
  {
    vscodeLanguageIds: ["javascript", "javascriptreact", "mongo", "mongodb"],
    extensions: [],
    parsers: [
      "babel",
      "espree",
      "meriyah",
      "babel-flow",
      "babel-ts",
      "flow",
      "typescript"
    ]
  },
  {
    vscodeLanguageIds: ["typescript"],
    extensions: [],
    parsers: ["typescript", "babel-ts"]
  },
  {
    vscodeLanguageIds: ["typescriptreact"],
    extensions: [],
    parsers: ["typescript", "babel-ts"]
  },
  {
    vscodeLanguageIds: ["json"],
    extensions: [],
    parsers: ["json-stringify"]
  },
  {
    vscodeLanguageIds: ["json"],
    extensions: [],
    parsers: ["json"]
  },
  {
    vscodeLanguageIds: ["jsonc"],
    parsers: ["json"]
  },
  {
    vscodeLanguageIds: ["json5"],
    extensions: [],
    parsers: ["json5"]
  },
  {
    vscodeLanguageIds: ["handlebars"],
    extensions: [],
    parsers: ["glimmer"]
  },
  {
    vscodeLanguageIds: ["graphql"],
    extensions: [],
    parsers: ["graphql"]
  },
  {
    vscodeLanguageIds: ["markdown"],
    parsers: ["markdown"]
  },
  {
    vscodeLanguageIds: ["mdx"],
    extensions: [],
    parsers: ["mdx"]
  },
  {
    vscodeLanguageIds: ["html"],
    extensions: [],
    parsers: ["angular"]
  },
  {
    vscodeLanguageIds: ["html"],
    extensions: [],
    parsers: ["html"]
  },
  {
    vscodeLanguageIds: ["html"],
    extensions: [],
    parsers: ["lwc"]
  },
  {
    vscodeLanguageIds: ["vue"],
    extensions: [],
    parsers: ["vue"]
  },
  {
    vscodeLanguageIds: ["yaml", "ansible", "home-assistant"],
    extensions: [],
    parsers: ["yaml"]
  }
]
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

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const CWD = "inmemory://model/"

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
    sourceCache: new LocalStorageCache(), // Cache loaded sources in localStorage. May be omitted
    // Other options...
    // fileRootPath: "node_modules/",
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

const prettier = new PrettierWorker()
function format(code: string, parser: string, options: Options) {
  return new Promise<string>((resolve) => {
    const id = v4()
    const handler = (
      event: MessageEvent<{
        id: string
        code: string
        type: "success" | "failed"
        error?: unknown
      }>
    ) => {
      if (event.data.id === id) {
        resolve(event.data.code)
        prettier.removeEventListener("message", handler)
      }
    }
    prettier.addEventListener("message", handler)
    prettier.postMessage({
      id,
      code,
      parser,
      ...options
    })
  })
}

async function installFormatter(
  _editor: editor.ICodeEditor | editor.IStandaloneCodeEditor,
  monaco: Monaco
) {
  languages.forEach((language) => {
    language.vscodeLanguageIds.forEach((id) => {
      monaco.languages.registerDocumentFormattingEditProvider(id, {
        async provideDocumentFormattingEdits(model) {
          return [
            {
              range: model.getFullModelRange(),
              text: await format(model.getValue(), language.parsers[0], {})
            }
          ]
        }
      })
    })
  })
}

export function Index() {
  const editorRef = useRef<editor.ICodeEditor | editor.IStandaloneCodeEditor>()
  const fileTreeRef = useRef<FuncShared>()

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

    const file = join("/", currentFile)
    return debounce(async (code: string | undefined) => {
      if (code === undefined) return

      console.log("auto saving %s", file)

      await fs.writeFile(file, code, "utf8")
    }, 1e3)
  }, [currentFile])
  // const resize

  return (
    <div className="page">
      <ToolBar />

      <div className="flex relative w-full flex-1">
        <Resizable
          defaultSize={{
            width: "220px",
            height: "100%"
          }}
          maxWidth="60%"
          minWidth="1"
          enable={{
            top: false,
            right: true,
            bottom: false,
            left: false,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false
          }}
          onResize={() =>
            editorRef.current?.layout({} as unknown as editor.IDimension)
          }
        >
          <div className="pl-3 pt-1 h-full border-x border-gray-700">
            <div className="ml-[-27px]">
              <div className="flex items-center justify-between ml-[22px] mr-[7px] py-1">
                <h1 className="text-[12px] uppercase font-bold">FCanvas</h1>
                <div className="text-[1.1rem] flex items-center">
                  <NoteAddOutlined
                    fontSize="inherit"
                    className="mr-1 cursor-pointer"
                    onClick={() => fileTreeRef.current?.createFile()}
                  />
                  <CreateNewFolderOutlined
                    fontSize="inherit"
                    className="mr-1 cursor-pointer"
                    onClick={() => fileTreeRef.current?.createDir()}
                  />
                  <ReplayOutlinedIcon
                    fontSize="inherit"
                    className="cursor-pointer"
                    onClick={() => fileTreeRef.current?.reloadDir()}
                  />
                </div>
              </div>

              <FileTreeNoRoot
                funcSharedRef={fileTreeRef}
                filepath="/"
                fs={fs}
              />
            </div>
          </div>
        </Resizable>

        <div className="w-full h-full flex">
          {currentFile || (
            <div className="w-full h-full text-center flex items-center justify-center">
              <Icon
                icon="fluent:code-text-edit-20-filled"
                className="w-120px h-120px text-gray-400"
              />
            </div>
          )}

          {currentFile !== null && (
            <Editor
              width="100%"
              options={{
                automaticLayout: true
              }}
              // defaultLanguage={currentFile ? extname(currentFile) : undefined}
              value={contentFile}
              theme="vs-dark"
              path={currentFile ? Uri.file(currentFile).toString() : undefined}
              onChange={autoSave}
              onMount={(
                editor: editor.ICodeEditor | editor.IStandaloneCodeEditor,
                monaco: Monaco
              ) => {
                // eslint-disable-next-line functional/immutable-data
                editorRef.current = editor
                initAutoTypes(editor, monaco)
                installFormatter(editor, monaco)
                // installESlint(editor, monaco)
              }}
            />
          )}
          <Resizable
            defaultSize={{
              width: "50%",
              height: "100%"
            }}
            maxWidth="60%"
            minWidth="1"
            enable={{
              top: false,
              right: false,
              bottom: false,
              left: true,
              topRight: false,
              bottomRight: false,
              bottomLeft: false,
              topLeft: false
            }}
            onResize={() =>
              editorRef.current?.layout({} as unknown as editor.IDimension)
            }
          >
            <div className="border-x border-gray-700 preview w-full h-full">
              preview
            </div>
          </Resizable>
        </div>
      </div>
    </div>
  )
}
