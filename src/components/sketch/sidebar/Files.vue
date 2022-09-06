<template>
  <div class="pt-2">
    <div class="flex flex-nowrap items-center px-2 justify-between pb-1">
      <h1 class="text-[12px] uppercase font-bold truncate">{{ editorStore.sketchName }}</h1>
      <div
        class="text-[1.1rem] flex flex-nowrap items-center children:mr-1 children:cursor-pointer"
      >
        <Icon
          icon="material-symbols:note-add-outline"
          fontSize="inherit"
          @click="fileTreeRef?.createFile()"
        />
        <Icon
          icon="material-symbols:create-new-folder-outline"
          fontSize="inherit"
          @click="fileTreeRef?.createDir()"
        />
        <Icon
          icon="material-symbols:replay"
          fontSize="inherit"
          @click="fileTreeRef?.reloadDir()"
        />
      </div>
    </div>

    <FileTree ref="fileTreeRef" filepath="/" :fs="fs" show />
  </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { fs } from "src/modules/fs"
import { useEditorStore } from "src/stores/editor"
import { ref } from "vue"

import FileTree from "./components/FileTree.vue"

const fileTreeRef = ref<typeof FileTree>()

const editorStore = useEditorStore()
</script>
