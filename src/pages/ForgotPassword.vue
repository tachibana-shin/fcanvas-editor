<template>
  <div class="max-w-[440px] px-6 mx-auto">
    <div class="mt-8 flex flex-col items-center">
      <template v-if="!reseted">
        <q-avatar class="ma-1" color="secondary">
          <Icon icon="material-symbols:lock-outline" />
        </q-avatar>
        <h1 class="text-h5">Reset your Password</h1>
      </template>
      <div v-else class="mt-1 flex flex-col items-center text-center">
        <q-avatar class="ma-1" color="secondary">
          <Icon icon="material-symbols:lock-outline" />
        </q-avatar>

        <h3 class="text-subtitle1">
          You will receive a password recovery link at your email address in a
          few minutes. Please check your mailbox
        </h3>
      </div>

      <q-form @submit.prevent="resetPassword()" class="mt-3 w-full">
        <template v-if="!reseted">
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
          <q-btn type="submit" color="blue" class="mt-3 w-full">
            Reset Password
          </q-btn>

          <LoginWithSocial />
        </template>

        <div class="mt-5 flex justify-between">
          <div class="link-xs">
            <router-link to="/sign-in" class="text-body2">
              Already have login and password? Sign In
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
import { getAuth, sendPasswordResetEmail } from "@firebase/auth"
import { Icon } from "@iconify/vue"
import { useQuasar } from "quasar"
import Copyright from "src/components/sign/Copyright.vue"
import LoginWithSocial from "src/components/sign/LoginWithSocial.vue"
import { createRuleEmail } from "src/helpers/createRules"
import { app } from "src/modules/firebase"
import { ref } from "vue"

const $q = useQuasar()
const reseted = ref(false)

const email = ref("")

const auth = getAuth(app)

async function resetPassword() {
  try {
    await sendPasswordResetEmail(auth, email.value)

     
    reseted.value = true
  } catch (err) {
    console.log(err)
    const error = err as AuthError
    $q.notify(`Reset password failed: ${error.message}`)
  }
}
</script>

<style lang="scss" scoped>
@import "./link-xs.scss";
</style>
