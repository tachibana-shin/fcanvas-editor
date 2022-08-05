import { getAuth } from "@firebase/auth"
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  updateDoc
} from "@firebase/firestore"
import { defineStore } from "pinia"
import gen from "project-name-generator"
import { Notify } from "quasar"
import type { Directory } from "src/libs/utils/types"
import { app } from "src/modules/firebase"
import { fs } from "src/modules/fs"
import type { Router } from "vue-router"

export const useEditorStore = defineStore("editor", {
  state: () => ({
    currentSelect: <string | null>null,
    currentFile: <string | null>null,

    autoRefresh: false,

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

        // eslint-disable-next-line functional/no-throw-statement
        throw err
      }
    },
    async saveSketch(router: Router) {
      const auth = getAuth(app)
      const db = getFirestore(app)

      if (!auth.currentUser) {
        Notify.create("You must be logged in to save sketch.")

        return
      }
      const sketches = collection(db, "users", auth.currentUser.uid, "sketches")

      // update sketch
      if (this.sketchId) {
        await updateDoc(doc(sketches, this.sketchId), await fs.commit("/"))
        fs.resetChangelog()

        Notify.create("Project saved successfully.")

        return
      }

      // new sketch
      const { id } = await addDoc(sketches, {
        name: this.sketchName,
        fs: fs.toFDBObject()
      })

      this.sketchId = id
      fs.resetChangelog()

      Notify.create("Project saved successfully.")

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
    }
  }
})
