<template>
  <Resizable
    :default-size="{
      width: '50%',
      height: '100%'
    }"
    max-width="60%"
    min-width="1"
    :enable="{
      top: false,
      right: false,
      bottom: false,
      left: true,
      topRight: false,
      bottomRight: false,
      bottomLeft: false,
      topLeft: false
    }"
  >
    <div class="border-l border-gray-700 preview w-full h-full">
      <iframe class="w-full h-full" :srcdoc="srcDoc"></iframe>
    </div>
  </Resizable>
</template>

<script lang="ts" setup>
import {fs} from "src/modules/fs"
import { computed } from "vue";

import Resizable from "../ui/Resizable.vue"

const srcDoc = computed(() => {
  return `
  <script type="importmap">
    ${JSON.stringify(
      Object.fromEntries(fs.objectURLMap.entries())
    )}
  <\\/script>
  `
})
</script>
