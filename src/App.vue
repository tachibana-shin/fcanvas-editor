<template>
  <router-view />
</template>

<script setup lang="ts">
import { getAuth, onAuthStateChanged } from "@firebase/auth"

import { app } from "./modules/firebase"
import { useAuthStore } from "./stores/auth"

const auth = getAuth(app)

const authStore = useAuthStore()

onAuthStateChanged(auth, (user) => {
   
  authStore.user = user
})
</script>
