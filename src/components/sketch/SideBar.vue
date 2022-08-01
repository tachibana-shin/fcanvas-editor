<template>
  <div class="flex flex-col items-center flex-nowrap border-r border-gray-700">
    <button
      v-for="{ icon, value } in tabs"
      :key="value"
      class="w-[48px] h-[48px] text-gray-500 hover:text-gray-400"
      :class="{
        '!text-inherit': tabSelection === value
      }"
      @click="
        () => {
          if (tabSelection === value) tabSelection = null
          else tabSelection = value
        }
      "
    >
      <Icon :icon="icon" class="w-[24px] h-[24px]" />
    </button>
  </div>

  <Resizable
    :default-size="{
      width: '220px',
      height: '100%'
    }"
    max-width="60%"
    min-width="1"
    :enable="{
      top: false,
      right: true,
      bottom: false,
      left: false,
      topRight: false,
      bottomRight: false,
      bottomLeft: false,
      topLeft: false
    }"
    :class="{
      hidden: tabSelection === null
    }"
  >
    <div class="pt-1 h-full border-r border-gray-700 overflow-x-hidden">
      <Files v-if="tabSelection === 'file'" />
      <Diff v-if="tabSelection === 'change'" />
      <Search />
    </div>
  </Resizable>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { ref } from "vue"

import Resizable from "../ui/Resizable.vue"

import Diff from "./sidebar/Diff.vue"
import Files from "./sidebar/Files.vue"
import Search from "./sidebar/Search.vue"

const tabSelection = ref<null | "file" | "search" | "change" | "setting">(
  "change"
)
const tabs: {
  icon: string
  value: Exclude<typeof tabSelection.value, null>
}[] = [
  {
    icon: "codicon:files",
    value: "file"
  },
  {
    icon: "codicon:search",
    value: "search"
  },
  {
    icon: "codicon:request-changes",
    value: "change"
  },
  {
    icon: "codicon:settings-gear",
    value: "setting"
  }
]
</script>
