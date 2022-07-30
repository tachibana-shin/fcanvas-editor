<template>
  <div
    v-if="loading"
    class="absolute w-full h-full flex items-center justify-center text-sm"
  >
    <div class="text-center">
      <q-spinner-hourglass color="primary" size="2em" />
      <br />
      Fetching Sketch...
    </div>
  </div>

  <div v-else class="page">
    <ToolBar />

    <div class="flex h-full">
      <SideBar />

      <div class="flex relative w-full flex-1">
        <div class="w-full h-full flex">
          <EditorFile />
          <Preview />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getFirestore, doc, getDoc } from "@firebase/firestore"
import { watch } from "vue"
import { useQuasar } from "quasar"
import { app } from "src/modules/firebase"
import { useEditorStore } from "src/stores/editor"
import sketchDefault from "src/templates/sketch-default"
import { ref } from "vue"
import { useRoute } from "vue-router"
import ToolBar from "components/sketch/ToolBar.vue"
import SideBar from "components/sketch/SideBar.vue"
import EditorFile from "components/sketch/EditorFile.vue"
import Preview from "components/sketch/Preview.vue"

const loading = ref(false)

const db = getFirestore(app)

const route = useRoute()
const $q = useQuasar()
const { createSketch } = useEditorStore()

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

      const { fs: template, name } = snap.data()!

      createSketch({
        id: snap.id,
        name,
        template
      })
    } catch {
      $q.notify("Sketch not found")
    }
  } else {
    createSketch({
      template: sketchDefault
    })
  }

  loading.value = false
}
</script>
