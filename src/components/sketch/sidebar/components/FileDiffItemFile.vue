<template>
  <div class="py-[3px] pl-[10px] cursor-pointer">
    <div
      :class="`flex items-center pl-20px ${CLASS_PATH_ACTIVE} ${
        FILE_COLOR[props.type]
      }`"
    >
      <img
        class="w-[1.2rem] h-[1.2rem]"
        :src="
          getIcon({
            light: false,
            isFolder: false,
            isOpen: false,
            filepath: props.name
          })
        "
      />
      <span class="text-[14px] pl-2 w-full truncate">{{ name }}</span>
      <small class="pr-1.5">{{ type[0] }}</small>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  name: string
  type: "ADDED" | "MODIFIED" | "DELETED"
}>()
</script>
