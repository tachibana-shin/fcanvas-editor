import type { editor } from "monaco-editor"
import { Resizable } from "re-resizable"
import type { useRef } from "react"

export function Preview(props: {
  editorRef: ReturnType<
    typeof useRef<editor.ICodeEditor | editor.IStandaloneCodeEditor>
  >
}) {
  const { editorRef } = props

  return (
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
      <div className="border-l border-gray-700 preview w-full h-full">
        preview
      </div>
    </Resizable>
  )
}
