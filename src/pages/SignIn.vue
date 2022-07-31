<template>
  <div class="max-w-[440px] px-6 mx-auto">
    <div class="mt-8 flex flex-col items-center">
      <q-avatar class="ma-1 bg-secondary">
        <Icon icon="material-symbols:lock-outline" />
      </q-avatar>
      <h1 class="text-h5">Sign in</h1>
      <q-form @submit.prevent="signIn()" class="mt-3 w-full">
        <q-input
          required
          outlined
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          class="mui-input"
          v-model="email"
          :rules="[createRuleEmail()]"
        />
        <q-input
          required
          outlined
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          class="mui-input"
          v-model="password"
          :rules="[createRulePassword()]"
        />
        <q-checkbox label="Remember me" v-model="remember" />

        <q-btn type="submit" color="blue" class="mt-3 w-full"> Sign In </q-btn>

        <LoginWithSocial />

        <div class="mt-5 flex justify-between">
          <div class="link-xs">
            <router-link to="/forgot-password" class="text-body2">
              Forgot password?
            </router-link>
          </div>
          <div class="link-xs">
            <router-link to="/sign-up" class="text-body2">
              Don't have an account? Sign Up
            </router-link>
          </div>
        </div>
      </q-form>
    </div>
    <Copyright class="mt-8 mb-4" />
  </div>
</template>

<script lang="ts" setup>
import type { AuthError } from "@firebase/auth"
import {
  AuthErrorCodes,
  getAuth,
  signInWithEmailAndPassword
} from "@firebase/auth"
import { Icon } from "@iconify/vue"
import { useQuasar } from "quasar"
import Copyright from "src/components/sign/Copyright.vue"
import LoginWithSocial from "src/components/sign/LoginWithSocial.vue"
import {
  createRuleEmail,
  createRulePassword
} from "src/helpers/createRules"
import { app } from "src/modules/firebase"
import { ref } from "vue"

import { useWatchAuth } from "./useWatchAuth"

const auth = getAuth(app)

const $q = useQuasar()
useWatchAuth()

const email = ref("")
const password = ref("")
const remember = ref(false)

async function signIn() {
  console.log({
    email: email.value,
    password: password.value
  })

  try {
    const { user } = await signInWithEmailAndPassword(
      auth,
      email.value,
      password.value
    )

    console.log(user)

    $q.notify(`Logged in as ${user.displayName}`)
  } catch (err) {
    switch ((err as AuthError).code) {
      case AuthErrorCodes.USER_DELETED:
        $q.notify("Login failed: User not found")
        break
      case AuthErrorCodes.INVALID_PASSWORD:
        $q.notify("Login failed: Invalid password")
        break

      default:
        $q.notify(`Login failed: ${(err as AuthError).message}`)
    }
  }
}
</script>

<style lang="scss" scoped>
@import "./link-xs.scss";
</style>
