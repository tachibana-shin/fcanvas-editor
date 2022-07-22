import type { User } from "@firebase/auth"
import { getAuth, onAuthStateChanged } from "@firebase/auth"
import { defineStore } from "react-mise"

import { app } from "~/modules/firebase"

const auth = getAuth(app)
export const useUserStore = defineStore({
  state: () => ({
    user: <User | null>auth.currentUser
  }),
  actions: {
    setUser(user: User | null) {
      // eslint-disable-next-line functional/immutable-data
      this.user = user
    }
  }
})

onAuthStateChanged(auth, (user) => {
  const [userStore] = useUserStore(true)

  userStore.setUser(user)
})
