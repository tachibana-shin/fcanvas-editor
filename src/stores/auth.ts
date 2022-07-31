import type { User } from "@firebase/auth"
import { defineStore } from "pinia"

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: <User | null>null
  })
})
