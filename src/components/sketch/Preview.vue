<template>
  <Resizable
    :default-size="{
      width: '50%',
      height: '100%'
    }"
    max-width="60%"
    min-width="1"
    :enable="{
      top: false,
      right: false,
      bottom: false,
      left: true,
      topRight: false,
      bottomRight: false,
      bottomLeft: false,
      topLeft: false
    }"
  >
    <div class="border-l border-gray-700 preview w-full h-full">
      <iframe ref="iframeRef" class="w-full h-full" :srcdoc="srcDoc"></iframe>
    </div>
  </Resizable>
</template>

<script lang="ts" setup>
/* eslint-disable no-useless-escape */
import { dirname, join, relative } from "path"

import { debounce } from "quasar"
import fcanvas from "src/../node_modules/fcanvas/dist/index.browser.mjs?raw"
import SystemJS from "src/../node_modules/systemjs/dist/system.src.js?raw"
import { readFileConfig } from "src/helpers/readFileConfig"
import {
  createBlobURL,
  fs,
  getBlobURLOfFile,
  isPathChange
} from "src/modules/fs"
import { onMounted, onUnmounted, ref } from "vue"

import Resizable from "../ui/Resizable.vue"

import cacheSystemjsFetch from "./raw/cache-systemjs-fetch.jse?raw"
import customSystemjsNormalize from "./raw/custom-systemjs-normalize.jse?raw"
import handleRequestRefrersh from "./raw/handle-request-refresh.jse?raw"

const dependencies = ref<Record<string, string>>({})
const srcDoc = ref("")

const watchPackagejson = async (path: string) => {
  if (isPathChange(path, "/package.json")) {
    const packageJSON = await readFileConfig(
      fs,
      ["/package.json"],
      (_f, content) => JSON.parse(content),
      {}
    )

    dependencies.value = {
      ...packageJSON.dependencies,
      ...packageJSON.devDependencies
    }
  }
}

watchPackagejson("/package.json")
fs.events.on("write", watchPackagejson)
onUnmounted(() => fs.events.off("write", watchPackagejson))

const watchIndexhtml = async (path: string) => {
  if (isPathChange(path, "/index.html")) {
    console.log("re-render preview")

    srcDoc.value = await renderPreview(
      await fs.readFile("/index.html").catch((err) => {
        console.warn("Error loading index.html")

        // eslint-disable-next-line promise/no-return-wrap
        return Promise.reject(err)
      }),
      dependencies.value
    )
  }
}

watchIndexhtml("/index.html")
fs.events.on("write", watchIndexhtml)
fs.events.on("unlink", watchIndexhtml)
onUnmounted(() => {
  fs.events.off("write", watchIndexhtml)
  fs.events.off("unlink", watchIndexhtml)
})

const iframeRef = ref<HTMLIFrameElement>()
onMounted(() => {
  const depends: string[] = []

  const handleFileChange = debounce((path: string) => {
    const needRefresh = depends.some((depend) => {
      return isPathChange(path, depend)
    })

    if (!needRefresh) return

    // file changed //
    console.log("file changed")
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    iframeRef.value?.contentWindow!.postMessage({
      type: "REFRESH"
    })
    // if change file require reload preview -> reset depends
    depends.splice(0)
  }, 1500)
  const controllerReadFS = async (
    event: MessageEvent<{
      id: string
      type: "GET_URL"
      filepath: string
    }>
  ) => {
    if (event.data.type === "GET_URL" && iframeRef.value?.contentWindow) {
      // scan fs
      try {
        const fsPath = join(
          "/",
          relative(dirname(location.pathname), event.data.filepath)
        )

        depends.push(fsPath)

        const filepathResolved = await getBlobURLOfFile(fsPath)

        iframeRef.value.contentWindow.postMessage({
          id: event.data.id,
          type: "GET_URL",
          filepath: filepathResolved
        })
      } catch (err) {
        // not exists
        // reject
        iframeRef.value.contentWindow.postMessage({
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
  onUnmounted(() => {
    window.removeEventListener("message", controllerReadFS)

    fs.events.off("write", handleFileChange)
    fs.events.off("unlink", handleFileChange)
  })
})

// ~~~~~~~ end helper ~~~~~~~

async function renderPreview(
  code: string,
  dependencies: Record<string, string>
) {
  console.log(dependencies)
  // load index.html
  // now get src file main.js
  code = code.replace(
    /\<script(?:\s+)src=(?:'|")([^'"]+)(?:'|")(?:[^>]*)??>(?:\s*)/gi,

    '\<script\>System.import("./$1")'
  )

  return (
    "<!--- load systemjs -->" +
    ` \<script src="${createBlobURL(SystemJS)}"\>\<\/script\>` +
    `\<script\>{${customSystemjsNormalize}}` +
    `{${cacheSystemjsFetch}}` +
    `{${handleRequestRefrersh}}\<\/script\>` +
    `\<script\>
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
<\/script>` +
    code
  )
}
</script>
