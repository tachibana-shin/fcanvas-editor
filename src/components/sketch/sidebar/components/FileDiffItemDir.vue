<template>
  <div class="select-none cursor-pointer pl-[10px]">
    <div
      v-if="!show"
      :class="`flex items-center mb-1.5 ${CLASS_PATH_ACTIVE}`"
      @click.stop="opened = !opened"
    >
      <Icon
        icon="material-symbols:chevron-right"
        class="my-auto text-[1.2rem]"
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
        hidden: !opened && !show
      }"
    >
      <template v-for="(diff, name) in files" :key="name">
        <FileDiffItemFile
          v-if="isDiffObject(diff)"
          :name="name as string"
          :type="(diff as unknown as Diff)[KEY_ACTION] as any"
        />
        <div v-else-if="isDiffMixed(diff)">{{ diff }}</div>
        <FileDiffItemDir
          v-else
          :name="name as string"
          :type="(diff as unknown as Diff)[KEY_ACTION] as any"
          :files="diff"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { KEY_ACTION } from "@tachibana-shin/diff-object"
import getIcon from "src/assets/extensions/material-icon-theme/dist/getIcon"
import { isDiffMixed } from "src/libs/utils/isDiffMixed"
import { isDiffObject } from "src/libs/utils/isDiffObject"
import { Diff } from "src/libs/utils/types"
import { ref } from "vue"

import FileDiffItemFile from "./FileDiffItemFile.vue"
import { CLASS_PATH_ACTIVE } from "./class-path-active"

defineProps<{
  show?: true
  name: string
  files: Diff
}>()

const opened = ref(false)
</script>
