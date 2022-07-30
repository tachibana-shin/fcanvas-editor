<template>
  <InputAutoFocus
    className="text-[14px] bg-gray-800 rounded py-1 px-2 mx-[-8px] hover:text-[#d9d9d9] focus-visible:outline-none"
    v-model="inputName"
    @blur="onBlur"
    @keydown="onKeydown"
  />
</template>

<script lang="ts" setup>
import { ref } from "vue"

const props = defineProps<{
  defaultValue: string
}>()
const emit = defineEmits<{
  (name: "save", value: string): void
  (name: "blur"): void
}>()

const inputName = ref("")

const onBlur = () => {
  if (inputName.value !== "" && inputName.value !== props.defaultValue)
    emit("save", inputName.value)

  emit("blur")
}
const onKeydown = (event: KeyboardEvent) => {
  if (event.key === "Enter") {
    if (inputName.value !== "") {
      ;(event.target as HTMLInputElement).blur()
    }
  }
}
</script>
