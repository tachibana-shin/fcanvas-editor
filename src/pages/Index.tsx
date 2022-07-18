import "./Index.scss"

import type { Monaco } from "@monaco-editor/react"
import Editor from "@monaco-editor/react"
import type { editor } from "monaco-editor"
import { AutoTypings, LocalStorageCache } from "monaco-editor-auto-typings"
import { join } from "path-browserify"
import { useRef } from "react"
// eslint-disable-next-line import/order
import { Resizable } from "re-resizable"

import "react-reflex/styles.css"

import { Item, Menu, Separator, Submenu } from "react-contexify"

import { FileTreeNoRoot } from "../components/editor/FileTree"
import { ToolBar } from "../components/editor/ToolBar"
// eslint-disable-next-line import/order
import { store } from "../store"

import "react-contexify/dist/ReactContexify.css"
import type { FS } from "../type/FS"

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

const fs: FS = {
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
  },
  async rename() {
    console.log("rename")
  },
  async mkdir() {
    console.log("mkdir")
  },
  async writeFile() {
    console.log("writeFile")
  }
}

const MENU_ID = "menu-id"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Index(props: unknown) {
  const editorRef = useRef<editor.ICodeEditor | editor.IStandaloneCodeEditor>()

  const { currentFileEdit } = store.getState().editor

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleItemClick({ event, props, triggerEvent, data }: any) {
    console.log(event, props, triggerEvent, data)
  }

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
            className="px-3 pt-2 h-full"
            style={{
              borderRight: "1px solid #aaa"
            }}
          >
            <ul className="ml-[-20px]">
              <FileTreeNoRoot filepath="/fcanvas" fs={fs} />
            </ul>

            <Menu id={MENU_ID} animation="fade" theme="dark">
              <Item onClick={handleItemClick}>Item 1</Item>
              <Item onClick={handleItemClick}>Item 2</Item>
              <Separator />
              <Item disabled>Disabled</Item>
              <Separator />
              <Submenu label="Submenu">
                <Item onClick={handleItemClick}>Sub Item 1</Item>
                <Item onClick={handleItemClick}>Sub Item 2</Item>
              </Submenu>
            </Menu>
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
          path={join(CWD, currentFileEdit ?? "")}
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
