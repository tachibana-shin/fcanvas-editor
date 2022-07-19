import type { User } from "@firebase/auth"
import { getAuth, onAuthStateChanged } from "@firebase/auth"
import { createSlice } from "@reduxjs/toolkit"

import { app } from "~/modules/firebase"

const auth = getAuth(app)

export const userStore = createSlice({
  name: "user",
  initialState: {
    user: <User | null>auth.currentUser
  },
  reducers: {
    setUser(
      state,
      action: {
        payload: User | null
      }
    ) {
      // eslint-disable-next-line functional/immutable-data
      state.user = action.payload
    }
  }
})

onAuthStateChanged(auth, (user) => {
  userStore.actions.setUser(user)
})
