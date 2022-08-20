<template>
  <div class="console bg-dark-600 fixed bottom-0 w-full z-40 h-[120px]">
    <ConsoleItem :data="data" />
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount } from "vue"
import { ConsoleItem, Encode } from "vue-console-feed"
import "vue-console-feed/style.css";

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
