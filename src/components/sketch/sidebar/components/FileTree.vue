<template>
  <FileTreeItemFile
    v-if="!dir"
    :filepath="filepath"
    :fs="fs"
    @rename="emit('rename', $event)"
    @unlink="emit('unlink', $event)"
  />
  <FileTreeItemDir
    v-else
    :filepath="filepath"
    :fs="fs"
    @rename="emit('rename', $event)"
    @unlink="emit('unlink', $event)"
  />
</template>

<script lang="ts" setup>
defineProps<{
  dir: boolean
  filepath: string
  fs: FS
}>()

const emit = defineEmits<{
  (name: "rename", value: string): void
  (name: "unlink"): void
}>()
</script>
