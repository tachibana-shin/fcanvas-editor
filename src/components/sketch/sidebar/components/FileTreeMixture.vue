<template>
  <FileTreeItemFile
    v-if="!dir"
    :filepath="filepath"
    :fs="fs"
    @rename="emit('rename', $event)"
    @unlink="emit('unlink')"
  />
  <FileTree
    v-else
    :filepath="filepath"
    :fs="fs"
    :show="show"
    @rename="emit('rename', $event)"
    @unlink="emit('unlink')"
  />
</template>

<script lang="ts" setup>
import type { FS } from "src/modules/fs"

import FileTree from "./FileTree.vue"
import FileTreeItemFile from "./FileTreeItemFile.vue"

defineProps<{
  dir: boolean
  filepath: string
  fs: FS
  show?: true
}>()

const emit = defineEmits<{
  (name: "rename", value: string): void
  (name: "unlink"): void
}>()
</script>
