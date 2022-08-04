<template>
  <div
    class="w-full h-full text-center flex items-center justify-center"
    v-if="!editorStore.currentFile"
  >
    <Icon
      icon="fluent:code-text-edit-20-filled"
      class="w-120px h-120px text-gray-400"
    />
  </div>
  <div ref="editorEl" class="w-[50%]" v-show="editorStore.currentFile" />
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import * as monaco from "monaco-editor"
import { Uri } from "monaco-editor"
import { debounce } from "quasar"
import { fs, watchFile } from "src/modules/fs"
import { useEditorStore } from "src/stores/editor"
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue"

import { installPackages } from "./logic/installPackage"
import { installFormatter } from "./logic/installPrettier"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

const editorEl = ref<HTMLDivElement>()
const editorRef = shallowRef<monaco.editor.IStandaloneCodeEditor>()

// TYPE: setEditFile
const views = new WeakMap<monaco.editor.ITextModel>()
// eslint-disable-next-line functional/no-let
let didChangeContender: monaco.IDisposable | null = null
// eslint-disable-next-line functional/no-let
let watcherFileChanged: (() => void) | null = null
onBeforeUnmount(() => {
  didChangeContender?.dispose()
  watcherFileChanged?.()
})
const setEditFile = async (filepath: string) => {
  editorStore.currentFile = filepath

  const editor = editorRef.value

  if (!editor) return

  const uri = Uri.file(filepath)

  const currentModel = editor.getModel()
  if (currentModel) {
    // save
    views.set(currentModel, editor.saveViewState())
  }

  const nextModel = monaco.editor.getModel(uri)
  if (nextModel) {
    editor.setModel(nextModel)
    // restore state
    editor.restoreViewState(views.get(nextModel))
  } else {
    const model = monaco.editor.createModel(
      await fs.readFile(filepath),
      undefined,
      uri
    )

    editor.setModel(model)
  }
  editor.focus()

  didChangeContender?.dispose()
  didChangeContender =
    editor.getModel()?.onDidChangeContent(
      debounce(async () => {
        const model = editor.getModel()

        if (model) {
          console.log("auto saving %s", editorStore.currentFile)
          await fs.writeFile(filepath, model.getValue())
        }
      }, 1000)
    ) ?? null
  watcherFileChanged?.()
  watcherFileChanged = watchFile(filepath, async (exists) => {
    if (exists) {
      const content = await fs.readFile(filepath)
      if (content !== editor.getValue()) editor.setValue(content)
    }
  })
}
// =================================================

defineExpose({
  editor: editorRef,
  setEditFile
})

watch(
  () => editorStore.currentFile,
  (file) => {
    if (!file) return

    setEditFile(file)
  }
)
onMounted(() => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const editor = monaco.editor.create(editorEl.value!, {
    automaticLayout: true,
    theme: "vs-dark"
  })
  editorRef.value = editor

  monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true)
  monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true)

  installFormatter()
  installPackages()
})
</script>
