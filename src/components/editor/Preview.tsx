import type { editor } from "monaco-editor"
import { join } from "path-browserify"
import { Resizable } from "re-resizable"
import { useEffect, useRef, useState } from "react"

import customSystemjsNormalize from "./raw/custom-systemjs-normalize.js?raw"
import handleRequestRefrersh from "./raw/handle-request-refresh.js?raw"

import SystemJS from "~/../node_modules/systemjs/dist/system.src.js?raw"
import { createBlobURL, fs, getBlobURLOfFile } from "~/modules/fs"

// ~~~~~~~ end helper ~~~~~~~

async function renderPreview(code: string) {
  // load index.html
  // now get src file main.js
  code = code.replace(
    /<script(?:\s+)src=(?:'|")([^'"]+)(?:'|")(?:[^>]*)??>(?:\s*)/gi,
    // eslint-disable-next-line quotes
    '<script>System.import("./$1")'
  )

  return (
    "<!--- load systemjs -->" +
    ` <script src="${createBlobURL(SystemJS)}"></script>` +
    `<script>{${customSystemjsNormalize}}` +
    `{${handleRequestRefrersh}}</script>` +
    `<script>
  System.config({
    baseURL: "https://unpkg.com/",
    defaultExtension: true,
    packages: {
      ".": {
        main: "./main.js",
        defaultExtension: "js"
      }
    },
    meta: {
      "*.js": {
        babelOptions: {}
      }
    },
    map: {
      "plugin-babel": "systemjs-plugin-babel@latest/plugin-babel.js",
      "systemjs-babel-build": "systemjs-plugin-babel@latest/systemjs-babel-browser.js"
    },
    transpiler: "plugin-babel"
  })
</script>` +
    code
  )
}

function Iframe() {
  const [srcdoc, setSrcdoc] = useState("")

  useEffect(() => {
    const handle = async (path: string) => {
      if (path === "/index.html") {
        console.log("re-render preview")
        // eslint-disable-next-line promise/catch-or-return
        renderPreview(
          await fs.readFile("/index.html").catch((err) => {
            console.warn("Error loading index.html")

            // eslint-disable-next-line promise/no-return-wrap
            return Promise.reject(err)
          })
        ).then((code) => setSrcdoc(code))
      }
    }
    handle("/index.html")

    fs.events.on("writeFile", handle)
    fs.events.on("unlink", handle)

    return () => {
      fs.events.off("writeFile", handle)
      fs.events.off("unlink", handle)
    }
  }, [])

  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  useEffect(() => {
    const depends: string[] = []
    const iframePreview = iframeRef.current

    const handleFileChange = (path: string) => {
      const needRefresh = depends.some((depend) => {
        return path === depend || depend.startsWith(`${path}/`)
      })

      if (!needRefresh) return

      // file changed //
      console.log("file changed")
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      iframePreview?.contentWindow!.postMessage({
        type: "REFRESH"
      })
      // if change file require reload preview -> reset depends
      depends.splice(0)
    }
    const controllerReadFS = async (
      event: MessageEvent<{
        id: string
        type: "GET_URL"
        filepath: string
      }>
    ) => {
      if (event.data.type === "GET_URL" && iframePreview?.contentWindow) {
        // scan fs
        try {
          const fsPath = join("/", event.data.filepath)

          depends.push(fsPath)

          const filepathResolved = await getBlobURLOfFile(fsPath)
          console.log({ filepath: filepathResolved })

          iframePreview.contentWindow.postMessage({
            id: event.data.id,
            type: "GET_URL",
            filepath: filepathResolved
          })
        } catch (err) {
          // not exists
          // reject
          iframePreview.contentWindow.postMessage({
            id: event.data.id,
            type: "GET_URL",
            error: (err as Error).message
          })
        }
      }
    }

    window.addEventListener("message", controllerReadFS)
    fs.events.on("writeFile", handleFileChange)
    fs.events.on("unlink", handleFileChange)
    return () => {
      window.removeEventListener("message", controllerReadFS)

      fs.events.off("writeFile", handleFileChange)
      fs.events.off("unlink", handleFileChange)
    }
  }, [iframeRef.current])

  return <iframe ref={iframeRef} className="w-full h-full" srcDoc={srcdoc} />
}

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
        <Iframe />
      </div>
    </Resizable>
  )
}
