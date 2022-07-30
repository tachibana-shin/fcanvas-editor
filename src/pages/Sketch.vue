<template>
  <div
    v-if="loading"
    className="absolute w-full h-full flex items-center justify-center text-sm"
  >
    <div className="text-center">
      <CircularProgress />
      <br />
      Fetching Sketch...
    </div>
  </div>

  <div v-else className="page">
    <ToolBar />

    <div className="flex h-full">
      <SideBar editorRef="{editorRef}" />

      <div className="flex relative w-full flex-1">
        <div className="w-full h-full flex">
          <EditorFile editorRef="{editorRef}" />
          <Preview editorRef="{editorRef}" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getFirestore, doc, getDoc } from "@firebase/firestore"
import { watch } from "fs"
import { useQuasar } from "quasar"
import { app } from "src/modules/firebase"
import { useEditorStore } from "src/stores/editor"
import sketchDefault from "src/templates/sketch-default"
import { ref } from "vue"
import { useRoute } from "vue-router"

const loading = ref(false)

const db = getFirestore(app)

const route = useRoute()
const $q = useQuasar()
const { createSketch } = useEditorStore()

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
      // eslint-disable-next-line promise/catch-or-return
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
