<template>
  <div class="w-full text-gray-200">
    <q-linear-progress height="2px" v-if="loading" />

    <div class="flex flex-nowrap relative mr-2">
      <div
        class="cursor-pointer hover:bg-dark-400 flex items-center"
        @click="openReplacer = !openReplacer"
      >
        <Icon
          icon="material-symbols:chevron-right"
          class="my-auto text-[1.2rem]"
          :class="{
            'transform rotate-90': openReplacer
          }"
        />
      </div>
      <div class="w-full min-w-0">
        <Input
          v-model="keyword"
          :actions="keywordActions"
          placeholder="Search"
        />
        <div class="flex flex-nowrap items-center mt-1" v-if="openReplacer">
          <Input
            v-model="replace"
            :actions="replaceActions"
            placeholder="Replace"
          />
          <Icon
            icon="codicon:replace-all"
            class="cursor-pointer px-[2px] w-[20px] h-full"
          />
        </div>
      </div>
    </div>

    <div class="text-right mx-2 mb-[-20px]">
      <Icon
        icon="ph:dots-three-bold"
        class="w-[24px] h-[24px] cursor-pointer"
        @click="openAdvanced = !openAdvanced"
      />
    </div>

    <div class="mx-2" v-if="openAdvanced">
      <small class="text-muted leading-0">files to include</small>
      <Input
        v-model="include"
        :actions="includeActions"
        placeholder="e.g. *.ts, src/**/include"
      />

      <small class="text-muted">files to exclude</small>
      <Input
        v-model="exclude"
        :actions="excludeActions"
        placeholder="e.g. *.ts, src/**/exclude"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { debounce } from "quasar"
import { ref, watchEffect } from "vue"

import Input from "./components/Input.vue"
import type { SearchResult } from "./logic/search"
import { search } from "./logic/search"

const openReplacer = ref(false)
const openAdvanced = ref(false)

const keyword = ref("")
const caseSensitive = ref(false)
const wholeWord = ref(false)
const regexp = ref(false)

const replace = ref("")
const preserveCase = ref(false)

const include = ref("")
const useExclude = ref(false)

const exclude = ref("")

const keywordActions = [
  {
    icon: "codicon:case-sensitive",
    model: caseSensitive
  },
  {
    icon: "codicon:whole-word",
    model: wholeWord
  },
  {
    icon: "codicon:regex",
    model: regexp
  }
]
const replaceActions = [
  {
    icon: "codicon:preserve-case",
    model: preserveCase
  }
]
const includeActions = [
  {
    icon: "codicon:book",
    model: preserveCase
  }
]
const excludeActions = [
  {
    icon: "codicon:exclude",
    model: useExclude
  }
]

const loading = ref(false)
const results = ref<AsyncGenerator<SearchResult, void, unknown>>()

const updateSearch = debounce(async () => {
  if (!keyword.value) return

  results.value = await search({
    search: keyword.value,
    caseSensitive: caseSensitive.value,
    wholeWord: wholeWord.value,
    regexp: regexp.value,
    include: include.value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    exclude: exclude.value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  })
}, 1000)

watchEffect(() => {
  updateSearch()
})
</script>
