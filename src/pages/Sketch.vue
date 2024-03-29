<template>
  <q-page
    v-if="loading"
    class="absolute w-full h-full flex items-center justify-center text-sm"
  >
    <div class="text-center">
      <q-spinner-hourglass color="primary" size="2em" />
      <br />
      Fetching Sketch...
    </div>
  </q-page>

  <q-page v-else class="flex column">
    <ToolBar />

    <div class="flex h-full flex-1">
      <SideBar v-model:show-console="showConsole" />

      <div class="flex flex-nowrap relative w-full flex-1">
        <EditorFile />
        <Preview ref="previewRef" />
        <Console
          v-show="showConsole"
          :iframe="(previewRef?.iframe as HTMLIFrameElement | undefined)"
          :importmap="(previewRef?.importmap as {
            imports: {
              [x: string]: string;
            }
          } | undefined)"
        />
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { doc, getDoc, getFirestore } from "@firebase/firestore"
import EditorFile from "components/sketch/EditorFile.vue"
import Preview from "components/sketch/Preview.vue"
import SideBar from "components/sketch/SideBar.vue"
import ToolBar from "components/sketch/ToolBar.vue"
import { useQuasar } from "quasar"
import Console from "src/components/sketch/Console.vue"
import { app } from "src/modules/firebase"
import { useEditorStore } from "src/stores/editor"
import sketchDefault from "src/templates/sketch-default"
import { ref, watch } from "vue"
import { useRoute } from "vue-router"
import { addEvent } from "./addEvent"

const previewRef = ref<typeof Preview>()

const loading = ref(false)

const db = getFirestore(app)

const route = useRoute()
const $q = useQuasar()
const editorStore = useEditorStore()

watch(() => route.params.userId, loadSketch)
watch(() => route.params.sketchId, loadSketch)
loadSketch()

async function loadSketch() {
  loading.value = true

  if (route.params.userId && route.params.sketchId) {
    const docRef = doc(
      db,
      "users",
      route.params.userId as string,
      "sketches",
      route.params.sketchId as string
    )

    try {
      const snap = await getDoc(docRef)

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { fs, name, isPublic = false } = snap.data()!

      editorStore.loadSketch({
        id: snap.id,
        name,
        isPublic,
        filesystem: fs
      })
    } catch {
      $q.notify("Sketch not found")
    }
  } else {
    editorStore.newSketch(sketchDefault)
  }

  loading.value = false
}

// ========= status ========
const showConsole = ref(true)
addEvent(window, "keydown", (event) => {
  if (event.ctrlKey && event.key === "`") {
    event.preventDefault()
    showConsole.value = !showConsole.value
  }
})
</script>
