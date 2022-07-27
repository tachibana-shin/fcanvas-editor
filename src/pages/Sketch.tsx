import "./Index.scss"

import type { editor } from "monaco-editor"
import { useRef } from "react"

import { EditorFile } from "~/components/sketch/EditorFile"
import { Preview } from "~/components/sketch/Preview"
import { SideBar } from "~/components/sketch/SideBar"
import { ToolBar } from "~/components/sketch/ToolBar"

export function Sketch() {
  const editorRef = useRef<editor.ICodeEditor | editor.IStandaloneCodeEditor>()

  return (
    <div className="page">
      <ToolBar />

      <div className="flex h-full">
        <SideBar editorRef={editorRef} />

        <div className="flex relative w-full flex-1">
          <div className="w-full h-full flex">
            <EditorFile editorRef={editorRef} />
            <Preview editorRef={editorRef} />
          </div>
        </div>
      </div>
    </div>
  )
}
