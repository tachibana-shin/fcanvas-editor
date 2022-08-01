<template>
  <div class="w-full px-3" v-if="!editorStore.sketchId">
    <small class="leading-0">
      Diff change not active. Please login and save sketch.
    </small>

    <button
      class="block w-full max-w-[250px] mt-1 mb-3 text-sm py-[3px] mx-auto bg-cyan-600"
      @click="editorStore.saveSketch(router)"
    >
      Save Sketch
    </button>
  </div>

  <div class="w-full" v-else>
    <div class="w-100 absolute top-0 left-0" v-if="loading">
      <q-linear-progress height="2px" />
    </div>

    <div class="text-center text-sm mt-3" v-if="fs.changelogLength.value === 0">
      Not change
    </div>

    <template v-else>
      <div
        class="block max-w-[250px] mt-1 mb-3 text-sm py-[3px] text-center bg-cyan-600 cursor-pointer"
        @click="
          ;async () => {
            loading = true
            await editorStore.saveSketch(router)
            loading = false
          }
        "
      >
        Save Sketch
      </div>
      <small class="text-[14px] block border-y border-gray-600 py-1 px-3">
        Changes
      </small>
      <div class="ml-[-15px] mt-2">
        <FileDiffItemDir show name="/" :files="fs.changelog" />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { fs } from "src/modules/fs"
import { useEditorStore } from "src/stores/editor"
import { ref } from "vue"
import { useRouter } from "vue-router"

import FileDiffItemDir from "./components/FileDiffItemDir.vue"

const editorStore = useEditorStore()
const router = useRouter()

const loading = ref(false)
</script>
