import type { User } from "@firebase/auth"
import { getAuth, onAuthStateChanged } from "@firebase/auth"
import { defineStore } from "react-mise"

const auth = getAuth()
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
