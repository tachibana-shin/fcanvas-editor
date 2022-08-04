<template>
  <FileTreeItemFile
    v-if="!dir"
    :filepath="filepath"
    :fs="fs"
  />
  <FileTree
    v-else
    :filepath="filepath"
    :fs="fs"
    :show="show"
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
</script>
