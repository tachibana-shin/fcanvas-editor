<template>
  <div class="select-none cursor-pointer">
    <div
      v-if="!show"
      class="py-[3px] flex items-center relative before:absolute before:w-full before:h-full before:left-0 before:top-0 before:z-[-1] hover:before:content-DEFAULT hover:before:bg-dark-600"
      :style="{
        paddingLeft: paddingLeft + 'px'
      }"
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
      <template
        v-for="{ name: childName, value: diff } in sortListDiff(files)"
        :key="childName"
      >
        <FileDiffItemFile
          v-if="isDiffObject(diff)"
          :dirname="(dirname ?? '') + '/' + name"
          :name="childName as string"
          :type="(diff as unknown as Diff)[KEY_ACTION] as any"
          :padding-left="paddingLeft"
        />
        <div
          v-else-if="isDiffMixed(diff)"
          class="border-r border-dotted border-yellow-500"
        >
          <!-- //KEY_DIFF_OBJECT_MIXED -->
          <FileDiffItemFile
            v-if="isDiffObject((diff as unknown as any)[KEY_DIFF_OBJECT_MIXED])"
            :dirname="(dirname ?? '') + '/' + name"
            :name="childName as string"
            :type="(diff as unknown as any)[KEY_DIFF_OBJECT_MIXED][KEY_ACTION] as any"
            :padding-left="paddingLeft"
          />
          <FileDiffItemDir
            v-else
            :dirname="(dirname ?? '') + '/' + name"
            :name="childName as string"
            :type="((diff as unknown as any)[KEY_DIFF_DIFF_MIXED])[KEY_ACTION] as any"
            :files="((diff as unknown as any))[KEY_DIFF_OBJECT_MIXED]"
            :padding-left="paddingLeft + 8"
          />
          <!-- // /KEY_DIFF_OBJECT_MIXED -->
          <!-- //KEY_DIFF_DIFF_MIXED -->
          <FileDiffItemFile
            v-if="isDiffObject((diff as unknown as any)[KEY_DIFF_DIFF_MIXED])"
            :dirname="(dirname ?? '') + '/' + name"
            :name="childName as string"
            :type="((diff as unknown as any)[KEY_DIFF_DIFF_MIXED])[KEY_ACTION] as any"
            :padding-left="paddingLeft"
          />
          <FileDiffItemDir
            v-else
            :dirname="(dirname ?? '') + '/' + name"
            :name="childName as string"
            :type="((diff as unknown as any)[KEY_DIFF_DIFF_MIXED])[KEY_ACTION] as any"
            :files="(diff as unknown as any)[KEY_DIFF_DIFF_MIXED]"
            :padding-left="paddingLeft + 8"
          />
          <!-- // /KEY_DIFF_DIFF_MIXED -->
        </div>
        <FileDiffItemDir
          v-else
          :dirname="(dirname ?? '') + '/' + name"
          :name="childName as string"
          :type="(diff as unknown as Diff)[KEY_ACTION] as any"
          :files="diff"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import sortArray from "sort-array"
import getIcon from "src/assets/extensions/material-icon-theme/dist/getIcon"
import {
  KEY_ACTION,
  KEY_DIFF_DIFF_MIXED,
  KEY_DIFF_OBJECT_MIXED
} from "src/libs/utils/const"
import { isDiffMixed } from "src/libs/utils/isDiffMixed"
import { isDiffObject } from "src/libs/utils/isDiffObject"
import type { DiffObject } from "src/libs/utils/types"
import { Diff } from "src/libs/utils/types"
import { ref } from "vue"

import FileDiffItemFile from "./FileDiffItemFile.vue"

withDefaults(
  defineProps<{
    show?: true
    name: string
    files: Diff
    dirname: string

    paddingLeft?: number
  }>(),
  { paddingLeft: 0 }
)

const opened = ref(true)

function sortListDiff(diff: Diff) {
  const dirs: { name: string; value: Diff }[] = []
  const files: { name: string; value: DiffObject }[] = []

  for (const name in diff) {
    const value = diff[name]
    if (isDiffObject(value)) {
      files.push({ name, value })
    } else if (isDiffMixed(value)) {
      const objectMixed = value[KEY_DIFF_OBJECT_MIXED]
      if (isDiffObject(objectMixed)) {
        files.push({ name, value: objectMixed })
      } else {
        dirs.push({ name, value: objectMixed })
      }

      const diffMixed = value[KEY_DIFF_DIFF_MIXED]
      if (isDiffObject(diffMixed)) {
        files.push({ name, value: diffMixed })
      } else {
        dirs.push({ name, value: diffMixed })
      }
    } else {
      dirs.push({ name, value })
    }
  }

  return [
    ...sortArray(dirs, {
      order: "asc",
      by: "name"
    }),
    ...sortArray(files, {
      order: "asc",
      by: "name"
    })
  ]
  // return {
  //   ...Object.fromEntries(
  //     sortArray(dirs, {
  //       order: "asc",
  //       by: "name"
  //     }).map(() => [])
  //   ),
  //   ...Object.fromEntries(
  //     sortArray(files, {
  //       order: "asc",
  //       by: "name"
  //     }).map((name) => [name, false])
  //   )
  // }
}
</script>
