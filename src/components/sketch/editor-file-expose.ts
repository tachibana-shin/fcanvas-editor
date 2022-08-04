import type * as monaco from "monaco-editor"

export const editorFileExpose = <
  {
    editor?: monaco.editor.IStandaloneCodeEditor
    setEditFile?: (filepath: string) => void
  }
>{}
