<template>
  <div
    className="flex items-center px-4 py-[10px] text-white  border-y border-gray-700 border-dotted"
  >
    <Fab color="primary" size="small">
      <PlayArrowIcon />
    </Fab>

    <div className="flex items-center text-[#d9d9d9] text-[14px] ml-2">
      <Checkbox size="small" />
      <span className="ml-1">Auto-refresh</span>
    </div>

    <div
      className="flex items-center ml-7 text-[#d9d9d9] text-[12px] cursor-pointer hover:text-green-400"
      @click="renaming = true"
    >
      <template v-if="!renaming">
        <span className="text-[14px] bg-transparent">{{ name }}</span>
        <Icon icon="bx:edit-alt" className="ml-1" />
      </template>
      <Rename
        defaultValue="{name}"
        @save="saveSketchName"
        @blue="renaming = false"
        v-else
      />
    </div>

    <div className="flex-1" />

    <Fab className="!bg-dark-600 !text-gray-300" size="small">
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
