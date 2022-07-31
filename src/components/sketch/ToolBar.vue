<template>
  <div
    class="flex items-center px-4 py-[10px] text-white border-y border-gray-700 border-dotted"
  >
    <q-btn round color="primary" size="small">
      <Icon icon="material-symbols:play-arrow-rounded" class="text-[1.2rem]" />
    </q-btn>

    <div class="flex items-center text-[#d9d9d9] text-[14px] ml-2">
      <q-checkbox v-model="editorStore.autoRefresh" size="24px" />
      <span class="ml-1">Auto-refresh</span>
    </div>

    <div
      class="flex items-center ml-7 text-[#d9d9d9] text-[12px] cursor-pointer hover:text-green-400"
      @click="renaming = true"
    >
      <template v-if="!renaming">
        <span class="text-[14px] bg-transparent">{{ editorStore.sketchName }}</span>
        <Icon icon="bx:edit-alt" class="ml-1" />
      </template>
      <RenameSketch
        :default-value="editorStore.sketchName!"
        @save="saveSketchName"
        @blur="renaming = false"
        v-else
      />
    </div>

    <div class="flex-1" />

    <q-btn round class="!bg-dark-600 !text-gray-300" size="small">
      <Icon icon="material-symbols:settings-outline" class="text-[1.2rem]" />
    </q-btn>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { useEditorStore } from "src/stores/editor"
import { ref } from "vue"

import RenameSketch from "./RenameSketch.vue"

const editorStore = useEditorStore()

const { saveSketchName } = useEditorStore()

const renaming = ref(false)
</script>
