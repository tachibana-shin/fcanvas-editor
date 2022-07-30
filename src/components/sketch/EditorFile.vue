<template>
  <div
    class="w-full h-full text-center flex items-center justify-center"
    v-if="editorStore.currentFile"
  >
    <Icon
      icon="fluent:code-text-edit-20-filled"
      class="w-120px h-120px text-gray-400"
    />
  </div>
  <div ref="editorEl" />
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue"
import monaco from "monaco-editor"
import { useEditorStore } from "src/stores/editor"
import { fs } from "src/modules/fs"
import { debounce } from "quasar"

import { Uri } from "monaco-editor"

import { installPackages } from "./logic/installPackage"
import { installFormatter } from "./logic/installPrettier"

// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
const PRETTIER_CONFIG_FILES = [
  ".prettierrc",
  ".prettierrc.json",
  ".prettierrc.json5",
  ".prettierrc.yaml",
  ".prettierrc.yml",
  ".prettierrc.toml",
  ".prettierrc.js",
  ".prettierrc.cjs",
  "package.json",
  "prettier.config.js",
  "prettier.config.cjs",
  ".editorconfig"
]

const editorStore = useEditorStore()

const contentFile = ref("")

const editorEl = ref<HTMLDivElement>()

const autoSave = debounce(async (code: string) => {
  if (!editorStore.currentFile) return

  if (code === undefined) return

  console.log("auto saving %s", editorStore.currentFile)

  await fs.writeFile(editorStore.currentFile, code)
})

onMounted(() => {
  const editor = monaco.editor.create(editorEl.value!, {
    automaticLayout: true,
    theme: "vs-dark"
  })

  installFormatter(editor, monaco)
  installPackages(editor, monaco)

  watch(contentFile, (val) => {
    editor.setValue(val)
  })
  watch(
    () => editorStore.currentFile,
    async (file) => {
      if (!file) return

      console.log("reading %s", file)

      monaco.editor.createModel(file, undefined, Uri.file(file))

      contentFile.value = await fs.readFile(file)
    }
  )
})
</script>
