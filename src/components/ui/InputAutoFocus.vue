<template>
  <input
    ref="input"
    type="text"
    :value="modelValue"
    @input="emit('update:modelValue', $event.target.value)"
    @blur="emit('blur')"
    @keydown="emit('keydown', $event)"
  />
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"

defineProps<{
  modelValue: string
}>()
const emit = defineEmits<{
  (name: "update:modelValue", val: string): void
  (name: "blur"): void
  (name: "keydown", event: KeyboardEvent): void
}>()

const input = ref<HTMLInputElement>()

onMounted(() => input.value?.focus())
</script>
