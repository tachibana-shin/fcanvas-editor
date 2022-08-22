<template>
  <div class="absolute z-40 h-full w-full pointer-events-none flex flex-col">
    <Resizable
      :default-size="{
        width: '100%',
        height: 'calc(100%-120px)'
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
      class="h-[calc(100%-120px)]"
    />
    <div
      class="pointer-events-auto bg-dark-600 h-full w-full flex-1 scroll-y scrollbar scrollbar-thumb-gray-900 scrollbar-track-gray-100 pb-[42px]"
    >
      <ConsoleItem :data="data" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useQuasar } from "quasar"
import { onBeforeUnmount } from "vue"
import { ConsoleItem, Encode } from "vue-console-feed"
import "vue-console-feed/style.css"

import Resizable from "../ui/Resizable.vue"

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
    type: "string"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args: any[]
  }>
) {
  console.log(event.data)
}
addEventListener("message", handleMessage)
onBeforeUnmount(() => removeEventListener("message", handleMessage))
</script>
