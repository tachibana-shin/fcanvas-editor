<template>
  <q-menu auto-close no-focus no-refocus>
    <slot name="before-menu" />
    <q-list :dense="dense" class="my-[3px]">
      <template v-for="item in menu" :key="item.name">
        <q-separator v-if="isDivider(item)" />
        <q-item
          clickable
          v-ripple
          @click="item.onClick"
          :class="{
            'min-h-[30px]': !dense
          }"
          v-else
        >
          <q-item-section avatar v-if="item.icon" class="min-w-0">
            <Icon :icon="item.icon" class="text-[1.2rem]" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ item.name }}</q-item-label>
          </q-item-section>
          <q-item-section side v-if="item.sub">
            {{ item.sub }}
          </q-item-section>
        </q-item>
      </template>
    </q-list>
  </q-menu>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"

defineProps<{
  chevron?: boolean
  dense?: boolean
  menu?: (
    | {
        icon?: string
        name: string
        sub?: string
        onClick?: () => void
      }
    | { divider: boolean }
  )[]
}>()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isDivider(item: any): item is {
  divider: boolean
} {
  return item.divider === true
}
</script>
