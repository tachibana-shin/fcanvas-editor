<template>
  <div class="w-full px-2 pt-2" v-if="!editorStore.sketchId">
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

  <div class="w-full pt-2" v-else>
    <div class="w-100 absolute top-0 left-0" v-if="loading">
      <q-linear-progress indeterminate color="blue" size="2px" />
    </div>

    <div class="text-center text-sm px-2" v-if="fs.changelogLength.value === 0">
      Not change
    </div>

    <template v-else>
      <div class="px-2 mt-1 mb-3">
        <q-btn
          dense
          no-caps
          class="w-full max-w-[250px] py-[3px] bg-cyan-600"
          @click="saveSketch"
        >
          Save Sketch
        </q-btn>
      </div>
      <div
        class="py-1 px-2 flex items-center justify-between text-[14px]"
      >
        Changes

        <span class="px-5px py-2px rounded-[30px] text-[12px] bg-cyan-500"
          >1</span
        >
      </div>

      <FileDiffItemDir show dirname="" name="/" :files="fs.changelog" />
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

async function saveSketch() {
  loading.value = true
  await editorStore.saveSketch(router)
  loading.value = false
}
</script>
