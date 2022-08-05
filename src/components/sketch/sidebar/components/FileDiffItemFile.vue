<template>
  <div class="py-[3px] cursor-pointer">
    <div
      :class="`flex flex-nowrap items-center pl-20px ${CLASS_PATH_ACTIVE} ${FILE_COLOR[type]}`"
      @click.stop="goto"
    >
      <img
        class="w-[1.2rem] h-[1.2rem]"
        :src="
          getIcon({
            light: false,
            isFolder: false,
            isOpen: false,
            filepath: name
          })
        "
      />
      <span class="text-[14px] pl-2 w-full truncate block flex-1">{{
        name
      }}</span>

      <div class="actions">
        <Icon
          icon="codicon:go-to-file"
          class="cursor-pointer pr-[2px] w-[18px] h-full"
          @click.stop="goto"
        />
        <Icon
          icon="codicon:discard"
          class="cursor-pointer pr-[2px] w-[18px] h-full"
          @click.stop="discard"
        />
      </div>

      <small class="pr-1.5">{{ type[0] }}</small>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { join } from "path-browserify"
import getIcon from "src/assets/extensions/material-icon-theme/dist/getIcon"
import { fs } from "src/modules/fs"
import { computed } from "vue"

import { editorFileExpose } from "../../editor-file-expose"

import { CLASS_PATH_ACTIVE } from "./class-path-active"

const props = defineProps<{
  name: string
  type: "ADDED" | "MODIFIED" | "DELETED"
  dirname: string
}>()
const filepath = computed(() => join("/", props.dirname, props.name))

const FILE_COLOR = {
  ADDED: " text-green-500",
  MODIFIED: " text-orange-600",
  DELETED: " text-red-600"
}

function goto() {
  console.log("goto file %s", filepath.value)
  editorFileExpose.setEditFile?.(filepath.value)
}
async function discard() {
  await fs.restore(filepath.value)
}
</script>
