<template>
  <div class="max-w-[440px] px-6 mx-auto">
    <div class="mt-8 flex flex-col items-center">
      <q-avatar class="ma-1 bg-secondary">
        <Icon icon="material-symbols:lock-outline" />
      </q-avatar>
      <h1 class="text-h5">Sign up</h1>
      <q-form @submit.prevent="signUp()" class="mt-3 w-full">
        <div class="pa-2 row">
          <div class="col-12 col-sm-6 pr-2">
            <q-input
              autoComplete="given-name"
              name="firstName"
              required
              outlined
              id="firstName"
              label="First Name"
              autoFocus
              class="mui-input"
              v-model="firstName"
              :rules="[ruleFirstName]"
            />
          </div>
          <div class="col-12 col-sm-6 pl-2">
            <q-input
              required
              outlined
              id="lastName"
              label="Last Name"
              name="lastName"
              autoComplete="family-name"
              class="mui-input"
              v-model="lastName"
              :rules="[ruleLastName]"
            />
          </div>
          <div class="col-12">
            <q-input
              required
              outlined
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              class="mui-input"
              v-model="email"
              :rules="[ruleEmail]"
            />
          </div>
          <div class="col-12">
            <q-input
              required
              outlined
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              class="mui-input"
              v-model="password"
              :rules="[rulePassword]"
            />
          </div>
          <div class="col-12">
            <q-checkbox
              label="I agree with terms and conditions. The security policy of the website"
              v-model="acceptAggress"
            />
          </div>
        </div>

        <q-btn type="submit" color="blue" class="mt-3 mb-2 w-full">
          Sign Up
        </q-btn>

        <LoginWithSocial />

        <div class="mt-5 flex justify-end">
          <div class="link-xs">
            <router-link to="/sign-in" class="text-body2">
              Already have an account? Sign in
            </router-link>
          </div>
        </div>
      </q-form>
    </div>
    <Copyright class="mt-5" />
  </div>
</template>

<script lang="ts" setup>
import type { AuthError } from "@firebase/auth"
import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile
} from "@firebase/auth"
import { Icon } from "@iconify/vue"
import { useQuasar } from "quasar"
import Copyright from "src/components/sign/Copyright.vue"
import LoginWithSocial from "src/components/sign/LoginWithSocial.vue"
import {
  createRuleEmail,
  createRuleLength,
  createRulePassword
} from "src/helpers/createRules"
import { app } from "src/modules/firebase"
import { ref } from "vue"
import { useRouter } from "vue-router"

import { useWatchAuth } from "./useWatchAuth"

const auth = getAuth(app)

const $q = useQuasar()
useWatchAuth()
const router = useRouter()

const firstName = ref("")
const lastName = ref("")
const email = ref("")
const password = ref("")
const acceptAggress = ref(false)

const ruleFirstName = createRuleLength(1, 15, "first name")
const ruleLastName = createRuleLength(1, 15, "last name")
const ruleEmail = createRuleEmail()
const rulePassword = createRulePassword()

const signUp = async () => {
  try {
    const { user } = await createUserWithEmailAndPassword(
      auth,
      email.value,
      password.value
    )
    await updateProfile(user, {
      displayName: `${firstName.value} ${lastName.value}`
    })

    console.log(user)

    $q.notify(`Sign up successfully! Hello ${user.displayName}`)
    router.push("/sign-in")
  } catch (err) {
    switch ((err as AuthError).code) {
      default:
        $q.notify(`Sign up failed: ${(err as AuthError).message}`)
    }
  }
}
</script>

<style lang="scss" scoped>
@import "./link-xs.scss";
</style>
