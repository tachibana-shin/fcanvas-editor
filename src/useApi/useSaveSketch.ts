import { getAuth } from "@firebase/auth"
import {
  addDoc,
  collection,
  getFirestore
} from "@firebase/firestore"
import { useNavigate } from "react-router"

import { app } from "~/modules/firebase"
import { fs } from "~/modules/fs"
import { useToast } from "~/plugins/toast"

export function useSaveSketch() {
  const auth = getAuth(app)
  const db = getFirestore(app)

  const navigate = useNavigate()
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

    if (fs.id) {
      // saved ok
      // await setDoc(doc(sketches, fs.id), {
      //   fs: fs.root
      // })
      await fs.commit()
      fs.createbatch(app)
      addToast("Project saved successfully.")

      return
    }

    const { id } = await addDoc(sketches, {
      fs: fs.toFDBObject()
    })

    // eslint-disable-next-line functional/immutable-data
    fs.id = id
    fs.createbatch(app)
    navigate(`/${auth.currentUser.uid}/sketch/${id}`, {
      replace: true
    })
    addToast("Project saved successfully.")
  }
}
