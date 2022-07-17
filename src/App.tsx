import type { Monaco } from "@monaco-editor/react"
import Editor, { useMonaco } from "@monaco-editor/react"
import type { editor } from "monaco-editor"
import {
  AutoTypings,
  LocalStorageCache
} from "monaco-editor-auto-typings/custom-editor"
import Router from "preact-router"
import { useEffect } from "preact/hooks"

import { Header } from "./components/app/Header"
import { ToolBar } from "./components/app/ToolBar"
import { Index } from "./pages/Index"

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

export function App() {
  const monaco = useMonaco()

  useEffect(() => {
    if (monaco) console.log("here is the monaco instance:", monaco)

    // initAutoTypes(monaco)
  }, [monaco])

  return (
    <>
      <Header />
      <ToolBar />
      // editor
      <Editor
        height="90vh"
        defaultLanguage="typescript"
        defaultValue={code}
        theme="vs-dark"
        path="inmemory://model/main.ts"
        onMount={initAutoTypes}
      />
      <Router>
        <Index path="/" />
      </Router>
    </>
  )
}
