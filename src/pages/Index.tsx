import "./Index.scss"

import type { Monaco } from "@monaco-editor/react"
import Editor from "@monaco-editor/react"
import type { editor } from "monaco-editor"
import { AutoTypings, LocalStorageCache } from "monaco-editor-auto-typings"
// eslint-disable-next-line import/order
import { useRef } from "preact/hooks"

import { Resizable } from "re-resizable"

import "react-reflex/styles.css"

import { FileTree } from "../components/editor/FileTree"
import { ToolBar } from "../components/editor/ToolBar"

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

const fs = {
  readdir() {
    return new Promise<string[]>((resolve) => resolve(["components"]))
  },
  lstat() {
    return new Promise<any>((resolve) =>
      resolve({
        isDirectory() {
          return true
        }
      })
    )
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Index(props: { path: string }) {
  const editorRef = useRef<editor.ICodeEditor | editor.IStandaloneCodeEditor>()

  return (
    <div class="page">
      <ToolBar />

      <div class="flex relative w-full flex-1">
        {/* prettier-ignore */ // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          /* @ts-expect-error */ }
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
          onResize={() => editorRef.current?.layout({} as unknown as any)}
        >
          <div class="px-3 pt-2 h-full" style="border-right: 1px solid #aaa">
            <ul class="ml-[-19.19px]">
              <FileTree isFolder notShowRoot filepath="/fcanvas" fs={fs} />
            </ul>
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
          path="inmemory://model/main.ts"
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
