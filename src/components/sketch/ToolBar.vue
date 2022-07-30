<template>
  <div
    class="flex items-center px-4 py-[10px] text-white border-y border-gray-700 border-dotted"
  >
    <Fab color="primary" size="small">
      <PlayArrowIcon />
    </Fab>

    <div class="flex items-center text-[#d9d9d9] text-[14px] ml-2">
      <Checkbox size="small" />
      <span class="ml-1">Auto-refresh</span>
    </div>

    <div
      class="flex items-center ml-7 text-[#d9d9d9] text-[12px] cursor-pointer hover:text-green-400"
      @click="renaming = true"
    >
      <template v-if="!renaming">
        <span class="text-[14px] bg-transparent">{{ name }}</span>
        <Icon icon="bx:edit-alt" class="ml-1" />
      </template>
      <Rename
        :default-name="name"
        @save="saveSketchName"
        @blue="renaming = false"
        v-else
      />
    </div>

    <div class="flex-1" />

    <Fab class="!bg-dark-600 !text-gray-300" size="small">
      <SettingsOutlinedIcon />
    </Fab>
  </div>
</template>

<script lang="ts" setup>
import { useEditorStore } from "src/stores/editor"
import { ref } from "vue"

defineProps<{
  name: string
}>()
const { saveSketchName } = useEditorStore()

const renaming = ref(false)
</script>
