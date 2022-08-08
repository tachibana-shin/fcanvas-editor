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
      <iframe class="w-full h-full" :srcdoc="srcDoc"></iframe>
    </div>
  </Resizable>
</template>

<script lang="ts" setup>
import type pkg from "src/../package.json"
import type { InfoFileMap } from "src/modules/compiler"
import { compiler, watchMap } from "src/modules/compiler"
import { fs, watchFile } from "src/modules/fs"
import { computed, onBeforeUnmount, reactive, ref, watchEffect } from "vue"

import Resizable from "../ui/Resizable.vue"

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
onBeforeUnmount(watchMap(objectMapCompiler))
watchEffect(() => {
  console.log("rebuild compiler")
  indexDotHtmlTransformed.value?.depends.forEach((file) => {
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
    2
  )
})

const srcDoc = computed(() => {
  if (!indexDotHtml.value) return

  console.log(objectMapCompiler)

  return `<script type="importmap">${
    importmap.value
    // eslint-disable-next-line no-useless-escape
  }<\/script>${indexDotHtmlTransformed.value?.code}`
})
</script>
