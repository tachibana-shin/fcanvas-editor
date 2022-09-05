<template>
  <div
    class="flex items-center px-4 py-[10px] text-[#d9d9d9] text-[14px] border-y border-gray-700 border-dotted"
  >
    <q-btn round color="primary" size="small">
      <Icon icon="material-symbols:play-arrow-rounded" class="text-[1.2rem]" />
    </q-btn>

    <div class="flex items-center ml-2">
      <q-checkbox v-model="editorStore.autoRefresh" size="24px" />
      <span class="ml-1">Auto-refresh</span>
    </div>

    <div
      class="flex items-center ml-7 cursor-pointer hover:text-green-400"
      @click="renaming = true"
    >
      <template v-if="!renaming">
        <span class="bg-transparent">{{ editorStore.sketchName }}</span>
        <Icon icon="bx:edit-alt" class="ml-1" />
      </template>
      <RenameSketch
        :default-value="editorStore.sketchName!"
        @save="saveSketchName"
        @blur="renaming = false"
        v-else
      />
    </div>

    <div class="flex items-center ml-2">
      <q-toggle
        :model-value="editorStore.isPublic"
        @update:model-value="editorStore.saveIsPublic"
        :disable="!userStore.user || !editorStore.sketchId"
        size="24px"
      />
      <span class="ml-1">{{
        editorStore.isPublic ? "public" : "private"
      }}</span>
    </div>

    <div class="flex-1" />

    <q-btn round class="!bg-dark-600 !text-gray-300" size="small">
      <Icon icon="material-symbols:settings-outline" class="text-[1.2rem]" />
    </q-btn>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { useAuthStore } from "src/stores/auth"
import { useEditorStore } from "src/stores/editor"
import { ref } from "vue"

import RenameSketch from "./RenameSketch.vue"

const editorStore = useEditorStore()
const userStore = useAuthStore()

const { saveSketchName } = useEditorStore()

const renaming = ref(false)
</script>
