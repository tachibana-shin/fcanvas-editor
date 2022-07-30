<template>
  <div className="select-none pl-[10px] cursor-pointer">
    <template v-if="!show">
      <div
        :class="[
          `flex items-center mb-1.5 ${CLASS_PATH_ACTIVE}`,
          {
            hidden: renaming,
            'before:content-DEFAULT !before:bg-dark-300':
              filepath === editorStore.currentSelect
          }
        ]"
        @click="onClick"
      >
        <Icon
          v-if="loading"
          icon="eos-icons:loading"
          className="w-[1.25rem] h-[1.25rem]"
        />
        <ChevronRight
          v-else
          fontSize="small"
          :class="{
            'transform rotate-90': opened
          }"
        />
        <img
          className="w-[1.2rem] h-[1.2rem]"
          :src="
            getIcon({
              light: false,
              isFolder: true,
              isOpen: opened,
              filepath
            })
          "
        />
        <span className="text-[14px] pl-2 truncate">{{ filename }}</span>
      </div>

      <RenameFileOrDir
        v-if="renaming"
        :dir="false"
        :default-value="filename"
        @save="rename"
        @blur="renaming = false"
      />
    </template>

    <Menu :menu="menu" />

    <div v-show="opened">
      <template
        v-for="item in adding ? sortListFiles([adding, ...files]) : files"
        :key="item.filepath"
      >
        <RenameFileOrDir
          v-if="item.filepath === ''"
          className="pl-[10px]"
          :dir="item.isDir"
          :siblings="siblings"
          @save="createNewFile($event, item.isDir)"
          @blur="adding = null"
        />
        <FileTree
          v-else
          :dir="item.isDir"
          :filepath="item.filepath"
          :fs="fs"
          @rename="
            (event) => {
              files.splice(files.indexOf(item) >>> 0, {
                filepath: join(dirname(filepath), event),
                isDir
              })
              files = sortListFiles(files)
            }
          "
          @unlink="
            () => {
              files = sortListFiles(splice(files, files.indexOf(item) >>> 0))
            }
          "
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { basename, join, dirname } from "path"
import Menu from "src/components/ui/Menu.vue"
import { FS, fs } from "src/modules/fs"
import { useEditorStore } from "src/stores/editor"
import { computed, ref } from "vue"
import { sortListFiles } from "../../utils/sortListFiles"
import { CLASS_PATH_ACTIVE } from "./class-path-active"
import RenameFileOrDir from "./components/RenameFileOrDir.vue"
import FileTree from "./FileTree.vue"

import getIcon from "src/assets/extensions/material-icon-theme/dist/getIcon"

const props = defineProps<{
  filepath: string
  fs: FS
  show?: true
}>()
const emit = defineEmits<{
  (name: "rename", value: string): void
  (name: "unlink"): void
}>()

const editorStore = useEditorStore()

const filename = computed(() => basename(props.filepath))
const renaming = ref(false)
const loading = ref(false)
const opened = ref(false)

interface FileDirItem {
  filepath: string
  isDir: boolean
}
const files = ref<FileDirItem[]>([])
const siblings = computed(() =>
  files.value.map((item) => basename(item.filepath))
)
const adding = ref<FileDirItem | null>(null)

function onClick() {
  editorStore.currentSelect = props.filepath
  opened.value = !opened.value
}

const menu = [
  {
    icon: "mdi-note-add-outline",
    name: "New File",
    onClick: createFile
  },
  {
    icon: "mdi-create-new-folder-outline",
    name: "New Folder",
    onClick: createDir
  },
  {
    divider: true
  },
  {
    icon: "mdi-content-cut",
    name: "Cut",
    sub: "⌘X"
  },
  {
    icon: "mdi-content-copy",
    name: "Copy",
    sub: "⌘C"
  },
  {
    icon: "mdi-content-paste",
    name: "Paste",
    sub: "⌘V"
  },
  {
    divider: true
  },
  {
    icon: "mdi-drive-file-rename-outline",
    name: "Rename",
    onClick() {
      renaming.value = true
    }
  },
  {
    icon: "mdi-delete-outline",
    name: "Delete",
    onClick: unlink
  }
]

const watcher = watch(opened, (state) => {
  if (state) {
    reloadDir()
    watcher()
  }
})

// =========== actions =============
async function rename(newFileName: string) {
  const newPath = join(dirname(props.filepath), newFileName)

  console.log("rename %s => %s", props.filepath, newPath)

  loading.value = true
  await fs.rename(props.filepath, newPath)
  loading.value = false

  emit("rename", newPath)
}
async function createNewFile(newFileName: string, isDir: boolean) {
  const newPath = join(props.filepath, newFileName)

  loading.value = true
  if (isDir) await fs.mkdir(newPath)
  else await fs.writeFile(newPath, "")
  loading.value = false

  files.value = sortListFiles([
    ...files.value,
    {
      filepath: newPath,
      isDir
    }
  ])
}
async function reloadDir() {
  await fs
    .readdir(filepath)
    .then(async (files) => {
      setFilesDir(
        sortListFiles(
          await Promise.all(
            files.map(async (name) => {
              const path = join(filepath, name)

              const isDir = (await fs.lstat(path)).isDirectory()

              return {
                filepath: path,
                isDir
              }
            })
          )
        )
      )
    })
    .catch((err) => {
      console.warn(err)
    })
    .finally(() => {
      setReadingDir(false)
      setReadiedDir(true)
    })
}
async function unlink() {
  loading.value = true
  await props.fs.unlink(props.filepath)

  props.onUnlink()
}
async function createFile() {
  opened.value = true
  adding.value = {
    filepath: "",
    isDir: false
  }
}
async function createDir() {
  opened.value = true
  adding.value = {
    filepath: "",
    isDir: true
  }
}
// =================================
</script>
