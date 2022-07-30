<template>
  <div
    class="text-center text-sm my-4 relative before:content-DEFAULT before:absolute before:left-0 before:top-[50%] before:w-full before:h-[1px] before:bg-[rgba(255,255,255,0.1)]"
  >
    <span class="bg-[#121212] px-1 relative z-2 text-gray-400">or</span>
  </div>

  <div class="text-center">
    <Button
      color="inherit"
      class="w-full max-w-[350px] !normal-case !bg-dark-500"
      @click="loginWith(googleProvider)"
    >
      <Icon
        icon="flat-color-icons:google"
        width="1.5rem"
        height="1.5rem"
        class="mr-1"
      />
      Sign in with Google
    </Button>
    <Button
      color="inherit"
      class="!mt-2 w-full max-w-[350px] !normal-case !bg-dark-500"
      @onClick="loginWith(githubProvider)"
    >
      <Icon icon="uiw:github" width="1.5rem" height="1.5rem" class="mr-1" />
      Sign in with GitHub
    </Button>
  </div>
</template>

<script lang="ts" setup>
import type { AuthError, AuthProvider } from "@firebase/auth"
import {
  getAuth,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup
} from "@firebase/auth"

const googleProvider = new GoogleAuthProvider()
const githubProvider = new GithubAuthProvider()

async function loginWith(provider: AuthProvider) {
  const auth = getAuth(app)

  try {
    const { user } = await signInWithPopup(auth, provider)

    console.log(user)

    $q.notify(`Logged in as ${user.displayName}`)
  } catch (err) {
    console.log(err)
    const error = err as AuthError
    $q.notify(`Login failed: ${error.message}`)
  }
}
</script>
