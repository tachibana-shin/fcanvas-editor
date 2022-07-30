<template>
  <div class="select-none cursor-pointer pl-[10px]">
    <div
      v-if="!show"
      :class="`flex items-center mb-1.5 ${CLASS_PATH_ACTIVE}`"
      @click.stop="opened = !opened"
    >
      <ChevronRight
        fontSize="small"
        :class="{
          'transform rotate-90': opened
        }"
      />
      <img
        class="w-[1.2rem] h-[1.2rem]"
        :src="
          getIcon({
            light: false,
            isFolder: true,
            isOpen,
            filepath: props.name
          })
        "
      />
      <span class="text-[14px] pl-2 truncate">{{ name }}</span>
    </div>

    <div
      :class="{
        hidden: !opened
      }"
    >
      <template v-for="(diff, name) in files" :key="name">
        <File
          v-if="isDiffObject(diff, false)"
          :name="name"
          :type="diff[KEY_ACTION]"
        />
        <Dir v-else :name="name" :type="diff[KEY_ACTION]" :files="diff" />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
const opened = ref(false)
</script>
