<template>
  <div class="py-[3px] cursor-pointer">
    <div
      :class="[
        `flex items-center pl-20px ${CLASS_PATH_ACTIVE}`,
        {
          hidden: renaming,
          'before:content-DEFAULT !before:bg-dark-300':
            filepath === editorStore.currentSelect
        }
      ]"
      @click="onClick"
    >
      <Icon
        v-if="loading"
        icon="eos-icons:loading"
        class="w-[1.25rem] h-[1.25rem] ml-[-1.25rem]"
      />
      <img
        class="w-[1.2rem] h-[1.2rem]"
        :src="
          getIcon({
            light: false,
            isFolder: false,
            isOpen: false,
            filepath
          })
        "
      />
      <span class="text-[14px] pl-2">{{ filename }}</span>
    </div>

    <RenameFileOrDir
      v-if="renaming"
      :dir="false"
      :default-value="filename"
      @save="rename"
      @blur="renaming = false"
    />

    <Menu :menu="menu" context-menu />
  </div>
</template>

<script lang="ts" setup>
import { basename, dirname, join } from "path"

import { Icon } from "@iconify/vue"
import getIcon from "src/assets/extensions/material-icon-theme/dist/getIcon"
import Menu from "src/components/ui/Menu.vue"
import type { FS } from "src/modules/fs"
import { useEditorStore } from "src/stores/editor"
import { computed, ref } from "vue"

import RenameFileOrDir from "./RenameFileOrDir.vue"
import { CLASS_PATH_ACTIVE } from "./class-path-active"

const props = defineProps<{
  filepath: string
  fs: FS
}>()
const emit = defineEmits<{
  (name: "rename", value: string): void
  (name: "unlink"): void
}>()

const editorStore = useEditorStore()

const filename = computed(() => basename(props.filepath))
const renaming = ref(false)
const loading = ref(false)

function onClick() {

  editorStore.currentSelect = props.filepath

  editorStore.currentFile = props.filepath
}

const menu = [
  {
    icon: "material-symbols:content-cut-rounded",
    name: "Cut",
    sub: "⌘X"
  },
  {
    icon: "material-symbols:content-copy-outline",
    name: "Copy",
    sub: "⌘C"
  },
  {
    icon: "material-symbols:content-paste",
    name: "Paste",
    sub: "⌘V"
  },
  {
    divider: true
  },
  {
    icon: "material-symbols:drive-file-rename-outline-outline",
    name: "Rename",
    onClick() {

      renaming.value = true
    }
  },
  {
    icon: "material-symbols:delete-outline",
    name: "Delete",
    onClick: () => unlink()
  }
]

async function rename(newFileName: string) {
  const newPath = join(dirname(props.filepath), newFileName)

  console.log("rename %s => %s", props.filepath, newPath)


  loading.value = true
  await props.fs.rename(props.filepath, newPath)

  loading.value = false

  emit("rename", newPath)
}
async function unlink() {

  loading.value = true
  await props.fs.unlink(props.filepath)

  emit("unlink")
}
</script>
