<template>
  <input ref="input" type="text" />
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"

const input = ref<HTMLInputElement>()

onMounted(() => input.value?.focus())
</script>
