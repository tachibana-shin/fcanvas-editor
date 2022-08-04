<template>
  <div class="select-none cursor-pointer">
    <div
      v-if="!show"
      :class="`flex items-center ${CLASS_PATH_ACTIVE}`"
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
        'pl-2': !show,
        hidden: !opened && !show
      }"
    >
      <template v-for="(diff, name) in files" :key="name">
        <FileDiffItemFile
          v-if="isDiffObject(diff)"
          :name="name as string"
          :type="(diff as unknown as Diff)[KEY_ACTION] as any"
        />
        <div
          v-else-if="isDiffMixed(diff)"
          class="border-r border-dotted border-yellow-500"
        >
          <!-- //KEY_DIFF_OBJECT_MIXED -->
          <FileDiffItemFile
            v-if="isDiffObject((diff as unknown as any)[KEY_DIFF_OBJECT_MIXED])"
            :name="name as string"
            :type="(diff as unknown as any)[KEY_DIFF_OBJECT_MIXED][KEY_ACTION] as any"
          />
          <FileDiffItemDir
            v-else
            :name="name as string"
            :type="((diff as unknown as any)[KEY_DIFF_DIFF_MIXED])[KEY_ACTION] as any"
            :files="((diff as unknown as any))[KEY_DIFF_OBJECT_MIXED]"
          />
          <!-- // /KEY_DIFF_OBJECT_MIXED -->
          <!-- //KEY_DIFF_DIFF_MIXED -->
          <FileDiffItemFile
            v-if="isDiffObject((diff as unknown as any)[KEY_DIFF_DIFF_MIXED])"
            :name="name as string"
            :type="((diff as unknown as any)[KEY_DIFF_DIFF_MIXED])[KEY_ACTION] as any"
          />
          <FileDiffItemDir
            v-else
            :name="name as string"
            :type="((diff as unknown as any)[KEY_DIFF_DIFF_MIXED])[KEY_ACTION] as any"
            :files="(diff as unknown as any)[KEY_DIFF_DIFF_MIXED]"
          />
          <!-- // /KEY_DIFF_DIFF_MIXED -->
        </div>
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
import getIcon from "src/assets/extensions/material-icon-theme/dist/getIcon"
import {
  KEY_ACTION,
  KEY_DIFF_DIFF_MIXED
, KEY_DIFF_OBJECT_MIXED } from "src/libs/utils/const"
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
