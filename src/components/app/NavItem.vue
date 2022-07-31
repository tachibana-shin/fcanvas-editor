<template>
  <q-btn
    dense
    flat
    no-caps
    class="text-sm text-gray-300 hover:text-gray-100 nav-item font-weight-normal"
    :ripple="false"
  >
    <slot />
    <q-icon v-if="chevron !== false" icon="transform rotate-90" size="sm" />

    <Menu v-if="menu" :menu="menu" />
  </q-btn>
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

<style lang="scss" scoped>
.nav-item :deep(.q-focus-helper) {
  display: none !important;
}
</style>
