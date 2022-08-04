<template>
  <div class="w-full text-gray-200 pt-2">
    <div class="w-100 absolute top-0 left-0" v-if="loading">
      <q-linear-progress indeterminate color="blue" size="2px" />
    </div>
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
            @click="replaceAll"
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

    <!-- result -->
    <div class="text-gray-400 px-3" v-show="results.size > 0 || loading">
      {{ sumResults }}
      results in {{ results.size }} files
    </div>
    <div class="search-results pl-2">
      <SearchResultItem
        v-for="[filepath, result] in results"
        :key="filepath"
        :filepath="filepath"
        :matches="result.matches"
        :replace="replace"
        @goto="goto(result.filepath, $event.start, $event.end)"
        @action:dismiss="dismissResult(filepath, result, $event)"
        @action:replace="replaceResult(filepath, result, $event)"
        @action:dismiss-all="results.delete(filepath)"
        @action:replace-all="replaceAllResult(filepath, result)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import * as monaco from "monaco-editor"
import { debounce } from "quasar"
import { fs, watchFile } from "src/modules/fs"
import type { Pos } from "src/workers/helpers/search-text"
import { computed, reactive, ref, watch } from "vue"

import Input from "./components/Input.vue"
import SearchResultItem from "./components/SearchResultItem.vue"
import type { SearchResult } from "./logic/search"
import { search, searchInFile } from "./logic/search"

const props = defineProps<{
  editorRef?: {
    editor: monaco.editor.IStandaloneCodeEditor
    setEditFile: (filepath: string) => void
  }
}>()

const openReplacer = ref(false)
const openAdvanced = ref(false)

const keyword = ref("")
const caseSensitive = ref(false)
const wholeWord = ref(false)
const regexp = ref(false)

const replace = ref("")
const preserveCase = ref(false)

const include = ref("")

const exclude = ref("")
const useExclude = ref(false)

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
const results = reactive<Map<string, SearchResult>>(new Map())
const sumResults = computed<number>(() => {
  // eslint-disable-next-line functional/no-let
  let sum = 0
  results.forEach(({ matches: { length } }) => {
    sum += length
  })
  return sum
})

watch(
  [keyword, caseSensitive, wholeWord, regexp, include, exclude, useExclude],
  () => {
    updateSearch()
  }
)

// eslint-disable-next-line functional/no-let
let searchController: AbortController | null = null
const watchesFile = new Set<() => void>()
const updateSearch = debounce(async () => {
  results.clear()
  watchesFile.forEach((canceler) => canceler())
  watchesFile.clear()

  if (!keyword.value) return

  loading.value = true

  searchController?.abort()
  searchController = new AbortController()

  const options = {
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
  }

  const asyncResult = await search(options, searchController)

  for await (const result of asyncResult) {
    const { filepath } = result
    results.set(filepath, result)
    console.log("result %s", filepath)
    const watcher = watchFile(filepath, async (exists) => {
      if (exists) {
        // refresh
        const newResult = await searchInFile(filepath, options)

        if (newResult.matches.length > 0) {
          results.set(filepath, newResult)

          return
        }
      }

      // if exists is false or newResult.matches.length is 0  これをあすこく。。。
      // unlink
      results.delete(filepath)
      watcher()
      watchesFile.delete(watcher)
    })
    watchesFile.add(watcher)
  }

  searchController = null

  loading.value = false
}, 1000)

function goto(filepath: string, start: Pos, end: Pos) {
  props.editorRef?.setEditFile(filepath)
  props.editorRef?.editor?.setSelection(
    new monaco.Selection(start.line, start.column, end.line, end.column)
  )
}
async function replaceAll() {
  for (const [filepath, result] of results) {
    await replaceAllResult(filepath, result)
  }
}
function dismissResult(filepath: string, result: SearchResult, index: number) {
  result.matches.splice(index, 1)
  if (result.matches.length === 0) {
    results.delete(filepath)
  }
}
async function replaceResult(
  filepath: string,
  result: SearchResult,
  index: number
) {
  loading.value = true

  const match = result.matches[index]

  console.log("replace result file %s", filepath)
  const content = await fs.readFile(filepath)
  await fs.writeFile(
    filepath,
    content.slice(0, match.index) +
      replace.value +
      content.slice(match.index + 1)
  )

  loading.value = false
}
async function replaceAllResult(filepath: string, result: SearchResult) {
  loading.value = true

  console.log("replace result file %s", filepath)
  const content = await fs.readFile(filepath)
  // eslint-disable-next-line functional/no-let
  let newContent = ""
  // eslint-disable-next-line functional/no-let
  let lastIndex = 0
  result.matches.forEach((match) => {
    newContent += content.slice(lastIndex, match.index) + replace.value
    lastIndex = match.index + match.match.length
  })
  newContent += content.slice(lastIndex)

  await fs.writeFile(filepath, newContent)

  loading.value = false
}
</script>
