import { getAuth } from "@firebase/auth"
import { defineStore } from "pinia"
import { Notify, useQuasar } from "quasar"
import { Directory } from "src/libs/InMemoryFS"
import { app } from "src/modules/firebase"
import { fs } from "src/modules/fs"
import { useRouter } from "vue-router"

import {
  addDoc,
  collection,
  doc,
  getFirestore,
  updateDoc
} from "@firebase/firestore"
import gen from "project-name-generator"

export const useEditorStore = defineStore("editor", {
  state: () => ({
    currentSelect: <string | null>null,
    currentFile: <string | null>null,

    sketchId: <string | null>null,
    sketchName: <string | null>null
  }),
  actions: {
    async saveSketchName(newName: string) {
      const auth = getAuth(app)

      if (!auth.currentUser) {
        Notify.create("You must be logged in to edit sketch name.")
        return
      }

      const { sketchName: oldName } = this

      this.sketchName = newName

      if (!this.sketchId) return

      const db = getFirestore(app)

      try {
        await updateDoc(
          doc(db, "users", auth.currentUser.uid, "sketches", this.sketchId),
          {
            name: newName
          }
        )
        Notify.create("Sketch name updated successfully")
      } catch (err) {
        this.sketchName = oldName

        Notify.create("Sketch name update failed")

        throw err
      }
    },
    async saveSketch() {
      const auth = getAuth(app)
      const db = getFirestore(app)

      const $q = useQuasar()

      const router = useRouter()

      if (!auth.currentUser) {
        $q.notify("You must be logged in to save sketch.")

        return
      }
      const sketches = collection(db, "users", auth.currentUser.uid, "sketches")

      // update sketch
      if (this.sketchId) {
        await fs.commit()
        fs.createbatch(app, this.sketchId)

        $q.notify("Project saved successfully.")

        return
      }

      // new sketch
      const { id } = await addDoc(sketches, {
        name: this.sketchName,
        fs: fs.toFDBObject()
      })
      this.sketchId = id
      fs.createbatch(app, id)

      $q.notify("Project saved successfully.")

      router.push(`/${auth.currentUser.uid}/sketch/${id}`)
    },
    async createSketch(payload: {
      id?: string
      name?: string
      template: Directory
    }) {
      this.sketchId = payload.id ?? null
      this.sketchName =
        payload.name ??
        gen({
          words: 2
        }).spaced

      fs.fromFDBObject(payload.template)

      if (payload.id) fs.createbatch(app, payload.id)
    }
  }
})
