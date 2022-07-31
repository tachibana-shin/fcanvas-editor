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
import { fs, isPathChange } from "src/modules/fs"
import { useEditorStore } from "src/stores/editor"
import { onMounted, ref, watch } from "vue"

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

const autoSave = debounce(async (code: string) => {
  if (!editorStore.currentFile) return

  if (code === undefined) return

  console.log("auto saving %s", editorStore.currentFile)

  await fs.writeFile(editorStore.currentFile, code)
}, 1000)

onMounted(() => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const editor = monaco.editor.create(editorEl.value!, {
    automaticLayout: true,
    theme: "vs-dark"
  })

  monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true)
  monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true)

  installFormatter()
  installPackages()

  const models = new Map<string, monaco.editor.ITextModel>()
  const views = new WeakMap<monaco.editor.ITextModel>()

  // eslint-disable-next-line functional/no-let
  let didChangeContenter: monaco.IDisposable | null = null
  watch(
    () => editorStore.currentFile,
    async (file) => {
      if (!file) return

      const currentModel = editor.getModel()

      if (currentModel) views.set(currentModel, editor.saveViewState())

      console.log("reading %s", file)

      // eslint-disable-next-line functional/no-let
      let model = models.get(file)

      if (!model) {
        model = monaco.editor.createModel(
          await fs.readFile(file),
          undefined,
          Uri.parse(file)
        )

        models.set(file, model)
      }

      editor.setModel(model)

      const viewInCache = views.get(model)
      if (viewInCache) {
        editor.restoreViewState(viewInCache)
      }
      editor.focus()

      didChangeContenter?.dispose()
      didChangeContenter =
        editor.getModel()?.onDidChangeContent(
          debounce(async () => {
            const model = editor.getModel()

            if (model) {
              console.log("save file %s", file)
              await fs.writeFile(file, model.getValue())
            }
          }, 1000)
        ) ?? null
    }
  )

  // watch remove model
  fs.events.on("unlink", (path) => {
    models.forEach((model, filepath) => {
      if (isPathChange(path, filepath)) {
        model.dispose()
        models.delete(filepath)
      }
    })
  })
})
</script>
