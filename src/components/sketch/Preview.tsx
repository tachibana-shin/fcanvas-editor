import throttle from "lodash.throttle"
import type { editor } from "monaco-editor"
import { dirname, join, relative } from "path-browserify"
import { Resizable } from "re-resizable"
import { useEffect, useRef, useState } from "react"

import cacheSystemjsFetch from "./raw/cache-systemjs-fetch.jse?raw"
import customSystemjsNormalize from "./raw/custom-systemjs-normalize.jse?raw"
import handleRequestRefrersh from "./raw/handle-request-refresh.jse?raw"

import fcanvas from "~/../node_modules/fcanvas/dist/index.browser.mjs?raw"
import SystemJS from "~/../node_modules/systemjs/dist/system.src.js?raw"
import { readFileConfig } from "~/helpers/readFileConfig"
import { createBlobURL, fs, getBlobURLOfFile, isPathChange } from "~/modules/fs"

// ~~~~~~~ end helper ~~~~~~~

async function renderPreview(
  code: string,
  dependencies: Record<string, string>
) {
  console.log(dependencies)
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
    `{${cacheSystemjsFetch}}` +
    `{${handleRequestRefrersh}}</script>` +
    `<script>
  System.config({
    baseURL: "https://unpkg.com/",
    defaultExtension: true,
    packages: {
      ".": {
        main: "./main.js",
        defaultExtension: "js",
      }
    },
    meta: {
      "*.js": {},
      "*.ts": {
      },
    },
    babelOptions: {
      es2015: false
    },
    map: {
      "plugin-babel": "https://unpkg.com/systemjs-plugin-babel@0.0.25/plugin-babel.js",
      "systemjs-babel-build": "https://unpkg.com/systemjs-plugin-babel@0.0.25/systemjs-babel-browser.js",
      "fcanvas": "${createBlobURL(fcanvas)}",
      ${Object.entries(dependencies)
        .map(([name, version]) => {
          return `"${name}": "${name}@${version}"`
        })
        .join(",")}
    },
    transpiler: "plugin-babel"
  })
</script>` +
    code
  )
}

function Iframe() {
  const [srcdoc, setSrcdoc] = useState("")
  const [dependencies, setDependencies] = useState({})

  useEffect(() => {
    const handle = async (path: string) => {
      if (isPathChange(path, "/package.json")) {
        const packageJSON = await readFileConfig(
          fs,
          ["/package.json"],
          (_f, content) => JSON.parse(content),
          {}
        )

        setDependencies({
          ...packageJSON.dependencies,
          ...packageJSON.devDependencies
        })
      }
    }

    handle("/package.json")
    fs.events.on("write", handle)

    return () => fs.events.off("write", handle)
  }, [])

  useEffect(() => {
    console.log("bind event index.html")
    const handle = async (path: string) => {
      if (isPathChange(path, "/index.html")) {
        console.log("re-render preview")
        // eslint-disable-next-line promise/catch-or-return
        renderPreview(
          await fs.readFile("/index.html").catch((err) => {
            console.warn("Error loading index.html")

            // eslint-disable-next-line promise/no-return-wrap
            return Promise.reject(err)
          }),
          dependencies
        ).then((code) => setSrcdoc(code))
      }
    }
    handle("/index.html")

    fs.events.on("write", handle)
    fs.events.on("unlink", handle)

    return () => {
      fs.events.off("write", handle)
      fs.events.off("unlink", handle)
    }
    // eslint-disable-next-line no-sparse-arrays
  }, [, dependencies])

  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  useEffect(() => {
    const depends: string[] = []
    const iframePreview = iframeRef.current

    const handleFileChange = throttle((path: string) => {
      const needRefresh = depends.some((depend) => {
        return isPathChange(path, depend)
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
    }, 500)
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
          const fsPath = join(
            "/",
            relative(dirname(location.pathname), event.data.filepath)
          )

          depends.push(fsPath)

          const filepathResolved = await getBlobURLOfFile(fsPath)

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
    fs.events.on("write", handleFileChange)
    fs.events.on("unlink", handleFileChange)
    return () => {
      window.removeEventListener("message", controllerReadFS)

      fs.events.off("write", handleFileChange)
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
