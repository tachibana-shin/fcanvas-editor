import { useAuthStore } from "src/stores/auth"
import { watch } from "vue"
import { useRoute, useRouter } from "vue-router"

export function useWatchAuth() {
  const authStore = useAuthStore()

  const route = useRoute()
  const router = useRouter()

  watch(
    () => authStore.user,
    (user) => {
      if (user) {
        if (typeof route.query.redirect === "string") {
          router.push(route.query.redirect)
        } else {
          router.push("/")
        }
      }
    },
    { immediate: true }
  )
}
