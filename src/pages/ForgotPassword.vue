<template>
  <q-container>
    <div class="mt-8 flex flex-col items-center">
      <template v-if="!reseted">
        <q-avatar class="ma-1" color="secondary">
          <LockOutlinedIcon />
        </q-avatar>
        <h1 class="text-h5">Reset your Password</h1>
      </template>
      <div v-else class="mt-1 flex flex-col items-center text-center">
        <q-avatar class="ma-1" color="secondary">
          <LockOutlinedIcon />
        </q-avatar>

        <h3 class="text-subtitle1">
          You will receive a password recovery link at your email address in a
          few minutes. Please check your mailbox
        </h3>
      </div>

      <q-form class="mt-1" @submit="resetPassword" noValidate>
        <template v-if="!reseted">
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
          <q-btn type="submit" fullWidth variant="contained" class="mt-3">
            Reset Password
          </q-btn>

          <LoginWithSocial />
        </template>

        <q-container class="mt-5">
          <Grid item xs>
            <Link href="/sign-in" variant="body2">
              Already have login and password? Sign In
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
import { getAuth, sendPasswordResetEmail, AuthError } from "@firebase/auth"
import { useQuasar } from "quasar"
import { app } from "src/modules/firebase"
import { ref } from "vue"

import { createRuleEmail } from "src/components/sign/validator"

const $q = useQuasar()
const reseted = ref(false)

const email = ref("")

const resetPassword = async (event: FormDataEvent) => {
  const auth = getAuth(app)

  event.preventDefault()

  const data = new FormData(event.currentTarget)

  console.log({
    email: data.get("email")
  })

  try {
    await sendPasswordResetEmail(auth, data.get("email") as string)

    reseted.value = true
  } catch (err) {
    console.log(err)
    const error = err as AuthError
    $q.notify(`Reset password failed: ${error.message}`)
  }
}
</script>
