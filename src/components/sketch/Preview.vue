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
import { fs, watchFile } from "src/modules/fs"
import { computed, onBeforeUnmount, ref } from "vue"

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

const srcDoc = computed(() => {
  return `<script type="importmap">${JSON.stringify(
    {
      imports: Object.assign(
        Object.fromEntries(
          Object.entries(
            packageDotJson.value === null
              ? {}
              : (JSON.parse(packageDotJson.value) as typeof pkg)
                  ?.dependencies ?? {}
          ).map(([name, version]) => {
            return [name, `https://cdn.skypack.dev/${name}@${version}`]
          })
        ),
        Object.fromEntries(
          Array.from(fs.objectURLMap.entries()).map(([path, blobUrl]) => {
            return [`~${path}`, blobUrl]
          })
        )
      )
    },
    null,
    2
    // eslint-disable-next-line no-useless-escape
  )}<\/script>${indexDotHtml.value && srcScriptToImport(indexDotHtml.value)}`
})
</script>
