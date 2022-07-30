<template>
  <button
    class="flex items-center px-[10px] py-[12px] text-sm text-gray-300 hover:text-gray-100"
  >
    <slot />
    <QIcon v-if="chevron !== false" icon="transform rotate-90" size="sm" />

    <Menu v-if="menu" :menu="menu" />
  </button>
</template>

<script lang="ts" setup>
import Menu from "../ui/Menu.vue"
defineProps<{
  chevron?: boolean
  menu?: (
    | {
        icon?: string
        name: string
        sub?: string
        onClick?: () => void
      }
    | { divider: true }
  )[]
}>()
</script>
