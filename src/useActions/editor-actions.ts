import { getAuth } from "@firebase/auth"
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  updateDoc
} from "@firebase/firestore"
import gen from "project-name-generator"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router"

import type { Directory } from "~/libs/InMemoryFS"
import { app } from "~/modules/firebase"
import { fs } from "~/modules/fs"
import { useToast } from "~/plugins/toast"
import { useStoreState } from "~/stores"

export function useSaveSketchName() {
  const store = useStoreState()
  const dispatch = useDispatch()

  const { addToast } = useToast()

  const auth = getAuth(app)

  return async (newName: string) => {
    if (!auth.currentUser) {
      addToast("You must be logged in to edit sketch name.")
      return
    }

    const { sketchName: oldName } = store.editor

    dispatch({
      type: "editor/setSketchName",
      payload: newName
    })

    if (!store.editor.sketchId) return

    const db = getFirestore(app)

    await updateDoc(
      doc(db, "users", auth.currentUser.uid, "sketches", store.editor.sketchId),
      {
        name: newName
      }
    )
      // eslint-disable-next-line promise/always-return
      .then(() => {
        addToast("Sketch name updated successfully")
      })
      .catch((err) => {
        dispatch({
          type: "editor/setSketchName",
          payload: oldName
        })

        addToast("Sketch name update failed")
        // eslint-disable-next-line promise/no-return-wrap
        return Promise.reject(err)
      })
  }
}

export function useSaveSketch() {
  const auth = getAuth(app)
  const db = getFirestore(app)
  const state = useStoreState().editor
  const { addToast } = useToast()

  const navigate = useNavigate()
  const dispatch = useDispatch()

  return async () => {
    if (!auth.currentUser) {
      addToast("You must be logged in to save sketch.")

      return
    }
    const sketches = collection(db, "users", auth.currentUser.uid, "sketches")

    // update sketch
    if (state.sketchId) {
      await fs.commit()
      fs.createbatch(app, state.sketchId)

      addToast("Project saved successfully.")

      return
    }

    // new sketch
    const { id } = await addDoc(sketches, {
      name: state.sketchName,
      fs: fs.toFDBObject()
    })
    dispatch({
      type: "editor/setSketchId",
      payload: id
    })
    fs.createbatch(app, id)

    addToast("Project saved successfully.")

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    navigate(`/${auth.currentUser!.uid}/sketch/${id}`, {
      replace: true
    })
  }
}

export function useCreateSketch() {
  const dispatch = useDispatch()

  return (payload: { id?: string; name?: string; template: Directory }) => {
    dispatch({
      type: "editor/setSketchId",
      payload: payload.id ?? null
    })
    dispatch({
      type: "editor/setSketchName",
      payload:
        payload.name ??
        gen({
          words: 2
        }).spaced
    })

    fs.fromFDBObject(payload.template)

    if (payload.id) fs.createbatch(app, payload.id)
  }
}
