<template>
  <q-menu>
    <q-list dense>
      <template>
        <slot name="menu-before" />

        <template v-for="item in menu" :key="item.name">
          <q-separator v-if="isDivider(item)" />
          <q-list-item v-clickable v-ripple @click="item.onClick" v-else>
            <q-item-section avatar v-if="item.icon">
              <q-icon :icon="item.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ item.name }}</q-item-label>
            </q-item-section>
            <q-item-section side v-if="item.sub">
              {{ item.sub }}
            </q-item-section>
          </q-list-item>
        </template>
      </template>
    </q-list>
  </q-menu>
</template>

<script lang="ts" setup>
defineProps<{
  chevron?: boolean
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
