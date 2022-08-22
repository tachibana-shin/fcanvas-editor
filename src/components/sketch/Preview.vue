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
    <div class="border-l border-gray-700 w-full h-full">
      <iframe class="w-full h-full" :srcdoc="srcDoc"></iframe>
    </div>
  </Resizable>
</template>

<script lang="ts" setup>
import type pkg from "src/../package.json"
import type { InfoFileMap } from "src/modules/compiler"
import { compiler, revokeObjectURLMap, watchMap } from "src/modules/compiler"
import { fs, watchFile } from "src/modules/fs"
import { computed, onBeforeUnmount, reactive, ref, watchEffect } from "vue"

import Resizable from "../ui/Resizable.vue"

import transportConsoleClient from "./injects/transport-console?braw"
import { srcScriptToImport } from "./logic/src-script-to-import"

function useWatchContentFile(path: string) {
  const content = ref<string | null>(null)

  const watcher = watchFile(
    path,
    async (exists) => {
      console.log("file %s change", path)
      if (exists) {
        content.value = await fs.readFile(path)
      } else {
        content.value = null
      }
    },
    {
      immediate: true
    }
  )

  onBeforeUnmount(watcher)

  return content
}

const packageDotJson = useWatchContentFile("/package.json")
const indexDotHtml = useWatchContentFile("/index.html")

const importmapDependencies = computed(() => {
  return Object.fromEntries(
    Object.entries(
      packageDotJson.value === null
        ? {}
        : (JSON.parse(packageDotJson.value) as typeof pkg)?.dependencies ?? {}
    ).map(([name, version]) => {
      return [name, `https://cdn.skypack.dev/${name}@${version}`]
    })
  )
})
const indexDotHtmlTransformed = computed(() => {
  if (!indexDotHtml.value) return null
  // const { code, depends } =
  return srcScriptToImport(indexDotHtml.value)
})
const objectMapCompiler = reactive(new Map<string, InfoFileMap>())

const watcherMap = watchMap(objectMapCompiler)
onBeforeUnmount(() => {
  watcherMap()
  revokeObjectURLMap(objectMapCompiler)
})
watchEffect(() => {
  console.log("rebuild compiler")
  indexDotHtmlTransformed.value?.depends.forEach((file) => {
    // revokeObjectURLMap(objectMapCompiler) // not require clean memory because content code not reborn and rebuild
    compiler(file, objectMapCompiler)
  })
})
const importmapScripts = computed(() => {
  console.log("rebuild importmap script")
  return Object.fromEntries(
    Array.from(objectMapCompiler.entries()).map(([path, info]) => {
      return [`~${path}`, info.blob]
    })
  )
})

const importmap = computed(() => {
  return JSON.stringify(
    {
      imports: {
        ...importmapDependencies.value,
        ...importmapScripts.value
      }
    },
    null,
    import.meta.env.NODE_ENV === "production" ? undefined : 2
  )
})

const srcDoc = computed(() => {
  if (!indexDotHtml.value) return

  // eslint-disable-next-line no-useless-escape
  return `\<script>${transportConsoleClient}<\/script><\/script><script type="importmap">${
    importmap.value
    // eslint-disable-next-line no-useless-escape
  }<\/script>${indexDotHtmlTransformed.value?.code}`
})
</script>
