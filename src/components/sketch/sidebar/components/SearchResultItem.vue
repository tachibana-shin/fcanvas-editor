<template>
  <div class="py-[3px] cursor-pointer">
    <div
      class="flex flex-nowrap items-center result before:absolute before:w-full before:h-full before:left-0 before:top-0 before:z-[-1] hover:before:content-DEFAULT hover:before:bg-dark-600"
      @click="opened = !opened"
    >
      <Icon
        icon="material-symbols:chevron-right"
        class="my-auto text-[1.2rem]"
        :class="{
          'transform rotate-90': opened
        }"
      />
      <img
        class="w-[1.2rem] h-[1.2rem]"
        :src="
          getIcon({
            light: false,
            isFolder: false,
            isOpen: false,
            filepath
          })
        "
      />
      <div class="flex flex-no-wrap flex-1">
        <div class="truncate flex-1">
          <span class="text-[14px] w-full pl-1">{{ basename(filepath) }}</span>
          <span
            class="text-gray-400 text-[12px] pl-1"
            v-if="filepath.includes('/')"
            >{{ filepath }}</span
          >
        </div>
        <div class="pr-2 hidden-parent-hover">
          <span class="badge bg-blue-600">{{ matches.length }}</span>
        </div>
      </div>
      <div class="actions hidden">
        <Icon
          icon="codicon:replace-all"
          class="cursor-pointer pr-[2px] w-[18px] h-full"
          @click.stop="emit('action:replaceAll')"
        />
        <Icon
          icon="codicon:close"
          class="cursor-pointer pr-[2px] w-[18px] h-full"
          @click.stop="emit('action:dismissAll')"
        />
      </div>
    </div>

    <!-- 1.3rem + 0.6rem = 1.9rem -->
    <div class="results ml-[1.5rem]" v-if="opened">
      <div
        v-for="({ before, match, after, posStart, posEnd }, index) in matches"
        :key="index"
        class="result flex flex-nowrap items-start"
        :class="`${CLASS_PATH_ACTIVE} before:!h-[100%] before:top-0`"
        @click="goto(posStart, posEnd)"
      >
        <div class="flex-1 whitespace-pre truncate">
          <span>{{ before }}</span>
          <span
            :class="{
              'line-through': replace,
              'bg-[rgba(15,98,90,0.67)]': !replace
            }"
            >{{ match }}</span
          >
          <span>{{ replace }}</span>
          <span>{{ after }}</span>
        </div>

        <div class="actions hidden">
          <Icon
            icon="codicon:replace"
            class="cursor-pointer pr-[2px] w-[18px] h-full"
            @click.stop="emit('action:replace', index)"
          />
          <Icon
            icon="codicon:close"
            class="cursor-pointer pr-[2px] w-[18px] h-full"
            @click.stop="emit('action:dismiss', index)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { basename } from "path-browserify"
import getIcon from "src/assets/extensions/material-icon-theme/dist/getIcon"
import type { Pos } from "src/workers/helpers/search-text"
import type { Result } from "src/workers/search-in-file"
import { ref } from "vue"

import { CLASS_PATH_ACTIVE } from "./class-path-active"
const props = defineProps<{
  filepath: string
  matches: Result["matches"]
  replace: string
}>()
const emit = defineEmits<{
  (
    name: "goto",
    value: {
      start: Pos
      end: Pos
    }
  ): void
  (name: "action:replace", index: number): void
  (name: "action:dismiss", index: number): void
  (name: "action:replaceAll"): void
  (name: "action:dismissAll"): void
}>()

const opened = ref(true)

function goto(start: Pos, end: Pos) {
  console.log("goto editor: ", {
    filepath: props.filepath,
    start,
    end
  })
  emit("goto", {
    start,
    end
  })
}
</script>

<style lang="scss" scoped>
.badge {
  padding: 3px 6px;
  border-radius: 11px;
  font-size: 11px;
  min-width: 18px;
  min-height: 18px;
  line-height: 11px;
  font-weight: 400;
  text-align: center;
  display: inline-block;
  box-sizing: border-box;
}
.result:hover {
  .actions {
    display: block !important;
  }
  .hidden-parent-hover {
    display: none !important;
  }
}
</style>
