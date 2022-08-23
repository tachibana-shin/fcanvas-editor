<template>
  <div class="absolute z-40 h-full w-full pointer-events-none flex flex-col">
    <Resizable
      :default-size="{
        width: '100%',
        height: 'calc(100%-260px)'
      }"
      :enable="{
        top: false,
        right: false,
        bottom: true,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false
      }"
      :resizer-classes="{
        bottom: 'pointer-events-auto'
      }"
      class="h-[calc(100%-260px)]"
    />
    <div
      class="pointer-events-auto bg-dark-600 h-full w-full flex-1 scroll-y scrollbar scrollbar-thumb-gray-900 scrollbar-track-gray-100 pb-[42px]"
    >
      <div
        class="py-[7px] text-[12px] uppercase bg-dark-800 text-[14px] flex items-center justify-between mx-[10px]"
      >
        Console

        <div class="flex items-center children:mr-1 children:cursor-pointer">
          <Icon icon="codicon:chevron-down" width="20" height="20" />
          <!-- <Icon icon="codicon:chevron-down" width="16" height="16" /> -->

          <Icon icon="codicon:clear-all" width="16" height="16" />
        </div>
      </div>

      <template v-for="(item, index) in consoleMessages" :key="index">
        <ConsoleTable
          v-if="item.name === 'table'"
          :data="item.args.table"
          :data-value="item.args.value"
        />
        <ConsoleItem
          v-else
          :data="item.args[0]"
          :type="item.name"
          :_get-list-link-async="getListLinkAsync"
          :read-link-object-async="readLinkObjectAsync"
        />
      </template>
      {{ consoleMessages }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { useQuasar } from "quasar"
import { v4 } from "uuid"
import { onBeforeUnmount, reactive } from "vue"
import type { _getListLink, Data } from "vue-console-feed"
import { ConsoleItem, ConsoleTable, Encode } from "vue-console-feed"
import "vue-console-feed/style.css"

import Resizable from "../ui/Resizable.vue"

const props = defineProps<{
  iframe?: HTMLIFrameElement
}>()

const consoleMessages = reactive<ReturnType<typeof Encode>[]>([])
const data = Encode(
  {
    name: "Shin",
    permission: ["admin"]
  },
  true,
  true
)

function handleMessage(
  event: MessageEvent<{
    type: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args: any[]
  }>
) {
  if (event.data.type === "error" || event.data.type === "console") {
    consoleMessages.push(event.data)
    console.log(event.data)
  }
}
addEventListener("message", handleMessage)
onBeforeUnmount(() => removeEventListener("message", handleMessage))

function getListLinkAsync(link: Data.Link) {
  return new Promise((resolve, reject) => {
    const id = v4()
    props.iframe?.contentWindow?.postMessage({
      id,
      type: "getListLink",
      link
    })

    const handler = (
      event: MessageEvent<{
        id: string
        result: ReturnType<typeof _getListLink>
      }>
    ) => {
      if (event.data.id !== id) return

      resolve(event.data.result)

      window.removeEventListener("message", handler)
    }

    window.addEventListener("message", handler)
  })
}
function readLinkObjectAsync(link: Data.Link) {
  return new Promise((resolve, reject) => {
    const id = v4()
    props.iframe?.contentWindow?.postMessage({
      id,
      type: "readLinkObject",
      link
    })

    const handler = (
      event: MessageEvent<{
        id: string
        result: ReturnType<typeof _getListLink>
      }>
    ) => {
      if (event.data.id !== id) return

      resolve(event.data.result)

      window.removeEventListener("message", handler)
    }

    window.addEventListener("message", handler)
  })
}
</script>
