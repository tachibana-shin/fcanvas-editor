import "./Index.scss"

import type { Monaco } from "@monaco-editor/react"
import Editor from "@monaco-editor/react"
import CreateNewFolderOutlined from "@mui/icons-material/CreateNewFolderOutlined"
import NoteAddOutlined from "@mui/icons-material/NoteAddOutlined"
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined"
import type { FuncShared } from "components/editor/FileTree"
import { FileTreeNoRoot } from "components/editor/FileTree"
import { ToolBar } from "components/editor/ToolBar"
import type { editor } from "monaco-editor"
import { AutoTypings, LocalStorageCache } from "monaco-editor-auto-typings"
import { useEffect, useRef, useState } from "react"
// eslint-disable-next-line import/order
import { Resizable } from "re-resizable"
import { fs } from "~/modules/fs"
import { useStoreState } from "~/stores"

const CWD = "inmemory://model/"

const code = `import path from "react"

path.resolve()`

async function initAutoTypes(
  editor: editor.ICodeEditor | editor.IStandaloneCodeEditor,
  monaco: Monaco
) {
  console.log("mounted editor")

  await AutoTypings.create(editor, {
    monaco,
    sourceCache: new LocalStorageCache(), // Cache loaded sources in localStorage. May be omitted
    // Other options...
    // fileRootPath: "node_modules/",
    // Log progress updates to a div console
    onUpdate(u, t) {
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
          <div
            className="pl-3 pt-1 h-full"
            style={{
              borderRight: "1px solid #aaa"
            }}
          >
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

        <Editor
          width="100%"
          options={{
            automaticLayout: true
          }}
          defaultLanguage="typescript"
          defaultValue={code}
          theme="vs-dark"
          // eslint-disable-next-line n/no-unsupported-features/node-builtins
          path={new URL(contentFile ?? "", CWD).href}
          onMount={(
            editor: editor.ICodeEditor | editor.IStandaloneCodeEditor,
            monaco: Monaco
          ) => {
            // eslint-disable-next-line functional/immutable-data
            editorRef.current = editor
            initAutoTypes(editor, monaco)
          }}
        />
      </div>
    </div>
  )
}
