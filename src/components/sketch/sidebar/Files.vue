<template>
  <div>
    <div class="flex items-center justify-between ml-[22px] mr-[7px] py-1">
      <h1 class="text-[12px] uppercase font-bold">FCanvas</h1>
      <div
        class="text-[1.1rem] flex items-center children:mr-1 children:cursor-pointer"
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
import { ref } from "vue"

import FileTree from "./components/FileTree.vue"

const fileTreeRef = ref()

console.log(fileTreeRef)
</script>
