import { getAuth } from "@firebase/auth"
import { addDoc, collection, getFirestore } from "@firebase/firestore"
import { useNavigate, useParams } from "react-router"

import { app } from "~/modules/firebase"
import { fs } from "~/modules/fs"
import { useToast } from "~/plugins/toast"
import { useStoreState } from "~/stores"

export function useSaveSketch() {
  const auth = getAuth(app)
  const db = getFirestore(app)

  const store = useStoreState()

  const navigate = useNavigate()
  const params = useParams()
  const { addToast } = useToast()

  return async () => {
    if (!auth.currentUser) {
      navigate("/sign-in?from=/", {
        state: {
          from: "/"
        }
      })

      addToast("You must be logged in to save project.")

      return
    }

    const sketches = collection(db, "users", auth.currentUser.uid, "sketches")

    if (params.sketchId) {
      await fs.commit()

      fs.createbatch(app, params.sketchId)
      addToast("Project saved successfully.")

      return
    }

    const { id } = await addDoc(sketches, {
      name: store.editor.sketchName,
      fs: fs.toFDBObject()
    })

    fs.createbatch(app, id)
    navigate(`/${auth.currentUser.uid}/sketch/${id}`, {
      replace: true
    })
    addToast("Project saved successfully.")
  }
}
