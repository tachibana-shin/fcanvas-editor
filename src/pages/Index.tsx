import "./Index.scss"

import { ToolBar } from "components/editor/ToolBar"
import type { editor } from "monaco-editor"
import { useRef } from "react"

import { EditorFile } from "~/components/editor/EditorFile"
import { Preview } from "~/components/editor/Preview"
import { SideBar } from "~/components/editor/SideBar"

export function Index() {
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
