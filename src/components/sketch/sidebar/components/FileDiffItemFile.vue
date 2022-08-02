<template>
  <div class="py-[3px] cursor-pointer">
    <div
      :class="`flex flex-nowrap items-center pl-20px ${CLASS_PATH_ACTIVE} ${FILE_COLOR[type]}`"
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
      <span class="text-[14px] pl-2 w-full truncate">{{ name }}</span>
      <small class="pr-1.5">{{ type[0] }}</small>
    </div>
  </div>
</template>

<script lang="ts" setup>
import getIcon from "src/assets/extensions/material-icon-theme/dist/getIcon"

import { CLASS_PATH_ACTIVE } from "./class-path-active"

defineProps<{
  name: string
  type: "ADDED" | "MODIFIED" | "DELETED"
}>()

const FILE_COLOR = {
  ADDED: " text-green-500",
  MODIFIED: " text-orange-600",
  DELETED: " text-red-600"
}
</script>
