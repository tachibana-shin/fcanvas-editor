<template>
  <div
    class="flex flex-col items-center flex-nowrap border-r border-gray-700 children:w-[48px] children:h-[48px] children:text-gray-500"
  >
    <button
      v-for="{ icon, value } in tabs"
      :key="value"
      class="hover:text-gray-400 relative before:bg-light-300 before:absolute before:h-full before:w-[2px] before:top-0 before:left-0"
      :class="{
        '!text-inherit': tabSelection === value,
        'before:content-DEFAULT': tabSelection === value
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

    <q-separator class="!w-[calc(100%-12px)] h-[1px]" />

    <button
      class="hover:text-gray-400 relative"
      @click="emit('update:show-console', !showConsole)"
    >
      <Icon icon="fluent:window-console-20-filled" class="w-[24px] h-[24px]" />
    </button>
  </div>

  <Resizable
    :default-size="{
      width: '220px',
      height: 'auto'
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
    <div class="h-full border-r border-gray-700 overflow-x-hidden relative">
      <KeepAlive>
        <Files v-if="tabSelection === 'file'" />
      </KeepAlive>
      <KeepAlive>
        <Diff v-if="tabSelection === 'change'" />
      </KeepAlive>
      <KeepAlive>
        <Search v-if="tabSelection === 'search'" />
      </KeepAlive>
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

defineProps<{
  showConsole: boolean
}>()
const emit = defineEmits<{
  (name: "update:show-console", value: boolean): void
}>()

const tabSelection = ref<null | "file" | "search" | "change" | "setting">(
  "file"
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
