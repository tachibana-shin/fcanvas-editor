import { getAuth } from "@firebase/auth"
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  setDoc
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

    if (fs.root.id) {
      // saved ok
      await setDoc(doc(sketches, fs.root.id), {
        fs: JSON.stringify(sketches)
      })

      return
    }

    const { id } = await addDoc(sketches, {
      name: "Los Angeles",
      state: "CA",
      country: "USA"
    })

    // eslint-disable-next-line functional/immutable-data
    fs.root.id = id
    navigate(`/${auth.currentUser.uid}/sketch/${id}`, {
      replace: true
    })
  }
}
