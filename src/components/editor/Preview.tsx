import { watchEffect } from "fcanvas"
import type { editor } from "monaco-editor"
import { join } from "path-browserify"
import { Resizable } from "re-resizable"
import type { useRef } from "react"
import { useState } from "react"

import SystemJS from "~/../node_modules/systemjs/dist/system.src.js?raw"
import type { FS } from "~/modules/fs"
import { fs } from "~/modules/fs"

const storeBlobs = new Map<string, string>()
function createBlobURL(id: string, content: string) {
  const inStore = storeBlobs.get(id)
  if (inStore) return inStore

  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  const url = URL.createObjectURL(new Blob([content]))

  storeBlobs.set(id, url)

  return url
}

async function renderPreview(fs: FS) {
  // load index.html
  return `
  <html>
    <!--- load systemjs -->
    <script src="${createBlobURL("systemjs", SystemJS)}"></script>
    <script>
    {
      let id = 0
      function getURLFile(filepath) {
        return new Promise((resolve, reject) => {
          const uid = id++ + ""
          const handle = (event) => {
            if (event.data.id === uid && event.data.type === "GET_URL") {
              // this event
              // console.log(event.data)
              if (event.data.error) {
                reject(new Error(event.data.error))
              } else {
                resolve(event.data.filepath)
              }
              window.removeEventListener("message", handle)
            }
          }
          window.addEventListener("message", handle)
          parent.postMessage({
            id: uid,
            type: "GET_URL",
            filepath
          })
        })
      }
      const { normalize } = System

      window.getURLFile = getURLFile
    }
    </script>
    <body>
    
      <script>
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
            "system-babel-build": "systemjs-plugin-babel@latest/system-babel-browser.js"
          },
          transpiler: "plugin-babel"
        })
      </script>
    </body>
  </html>
  `
}

function Iframe() {
  const [srcdoc, setSrcdoc] = useState("")
  watchEffect(() => {
    // eslint-disable-next-line promise/catch-or-return
    renderPreview(fs).then((code) => setSrcdoc(code))
  })

  return (
    <iframe
      className="w-full h-full"
      srcDoc={srcdoc}
      onLoad={(event) => {
        const iframe = event.target as unknown as HTMLIFrameElement

        window.addEventListener(
          "message",
          async (
            event: MessageEvent<{
              id: string
              type: "GET_URL"
              filepath: string
            }>
          ) => {
            if (event.data.type === "GET_URL" && iframe.contentWindow) {
              // scan fs
              try {
                // read file
                const filepathResolved = createBlobURL(
                  event.data.filepath,
                  await fs.readFile(join("/", event.data.filepath), "utf8")
                )

                iframe.contentWindow.postMessage({
                  id: event.data.id,
                  type: "GET_URL",
                  filepath: filepathResolved
                })
              } catch (err) {
                // not exists
                // reject
                iframe.contentWindow.postMessage({
                  id: event.data.id,
                  type: "GET_URL",
                  error: (err as Error).message
                })
              }
            }
          }
        )
      }}
    />
  )
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
