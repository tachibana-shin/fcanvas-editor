<template>
  <q-container component="main" maxWidth="xs">
    <div class="mt-8 flex flex-col items-center">
      <q-avatar class="ma-1 bg-secondary">
        <LockOutlinedIcon />
      </q-avatar>
      <h1 class="text-h5">Sign in</h1>
      <q-form @submit="signIn" class="mt-1">
        <q-input
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          v-model="email"
          :rules="[createRuleEmail()]"
        />
        <q-input
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          v-model="password"
          :rules="[createRulePassword()]"
        />
        <q-checkbox label="Remember me" />

        <q-btn type="submit" fullWidth variant="contained" class="mt-3">
          Sign In
        </q-btn>

        <LoginWithSocial />

        <q-container class="mt-5">
          <Grid item xs>
            <Link href="/forgot-password" variant="body2">
              Forgot password?
            </Link>
          </Grid>
          <Grid item>
            <Link href="/sign-up" variant="body2">
              {"Don't have an account? Sign Up"}
            </Link>
          </Grid>
        </q-container>
      </q-form>
    </div>
    <Copyright class="mt-8 mb-4" />
  </q-container>
</template>

<script lang="ts" setup>
import { getAuth, signInWithEmailAndPassword, AuthError } from "@firebase/auth"
import { useQuasar } from "quasar"
import { app } from "src/modules/firebase"
import { ref } from "vue"

import {
  createRuleEmail,
  createRulePassword
} from "src/components/sign/validator"

const auth = getAuth(app)

const $q = useQuasar()

const email = ref("")
const password = ref("")

const signIn = async (event: FormDataEvent) => {
  event.preventDefault()

  const data = new FormData(event.currentTarget)

  console.log({
    email: data.get("email"),
    password: data.get("password")
  })

  try {
    const { user } = await signInWithEmailAndPassword(
      auth,
      data.get("email") as string,
      data.get("password") as string
    )

    console.log(user)

    $q.notify(`Logged in as ${user.displayName}`)
  } catch (err) {
    console.log(err)
    const error = err as AuthError
    $q.notify(`Login failed: ${error.message}`)
  }
}
</script>
