<template>
  <Resizable>
    <slot />
  </Resizable>
</template>

<script lang="ts" setup>
import { Resizable } from "vue-re-resizable"
import "vue-re-resizable/dist/style.css"
</script>

<style lang="scss" scoped></style>
