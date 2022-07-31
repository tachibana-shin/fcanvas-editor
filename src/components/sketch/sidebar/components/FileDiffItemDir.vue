<template>
  <div class="select-none cursor-pointer pl-[10px]">
    <div
      v-if="!show"
      :class="`flex items-center mb-1.5 ${CLASS_PATH_ACTIVE}`"
      @click.stop="opened = !opened"
    >
      <ChevronRight
        fontSize="small"
        :class="{
          'transform rotate-90': opened
        }"
      />
      <img
        class="w-[1.2rem] h-[1.2rem]"
        :src="
          getIcon({
            light: false,
            isFolder: true,
            isOpen: opened,
            filepath: name
          })
        "
      />
      <span class="text-[14px] pl-2 truncate">{{ name }}</span>
    </div>

    <div
      :class="{
        hidden: !opened
      }"
    >
      <template v-for="(diff, name) in files" :key="name">
        <FileDiffItemFile
          v-if="isDiffObject(diff, false)"
          :name="name"
          :type="(diff as unknown as Diff<false>)[KEY_ACTION]"
        />
        <FileDiffItemDir
          v-else
          :name="name"
          :type="diff[KEY_ACTION]"
          :files="diff"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Diff, isDiffObject, KEY_ACTION } from "@tachibana-shin/diff-object"
import getIcon from "src/assets/extensions/material-icon-theme/dist/getIcon"
import { ref } from "vue"

import FileDiffItemFile from "./FileDiffItemFile.vue"
import { CLASS_PATH_ACTIVE } from "./class-path-active"

defineProps<{
  show?: true
  name: string
  files: Diff<false>
}>()

const opened = ref(false)
</script>
