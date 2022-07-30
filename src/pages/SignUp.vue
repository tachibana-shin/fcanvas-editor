<template>
  <q-container component="main" maxWidth="xs">
    <div class="mt-8 flex flex-col items-center">
      <q-avatar class="ma-1 bg-secondary">
        <LockOutlinedIcon />
      </q-avatar>
      <h1 class="text-h5">Sign up</h1>
      <q-form class="mt-3" @submit="signUp">
        <q-container class="pa-2">
          <div class="col-12 col-sm-6">
            <q-input
              autoComplete="given-name"
              name="firstName"
              required
              fullWidth
              id="firstName"
              label="First Name"
              autoFocus
              v-model="firstName"
              :rules="[ruleFirstName]"
            />
          </div>
          <div class="col-12 col-sm-6">
            <q-input
              required
              fullWidth
              id="lastName"
              label="Last Name"
              name="lastName"
              autoComplete="family-name"
              v-model="lastName"
              :rules="[ruleLastName]"
            />
          </div>
          <div class="col-12">
            <q-input
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              v-model="email"
              :rules="[ruleEmail]"
            />
          </div>
          <div class="col-12">
            <q-input
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              v-model="password"
              :rules="[rulePassword]"
            />
          </div>
          <div class="col-12">
            <q-checkbox
              label="I agree with terms and conditions. The security policy of the website"
            />
          </div>
        </q-container>

        <q-btn type="submit" fullWidth variant="contained" class="mt-3 mb-2">
          Sign Up
        </q-btn>

        <LoginWithSocial />

        <Grid container class="mt-5" justifyContent="flex-end">
          <Grid item>
            <Link href="/sign-in" variant="body2">
              Already have an account? Sign in
            </Link>
          </Grid>
        </Grid>
      </q-form>
    </div>
    <Copyright class="mt-5" />
  </q-container>
</template>

<script lang="ts" setup>
import {
  AuthError,
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile
} from "@firebase/auth"
import { useQuasar } from "quasar"
import {
  createRuleLength,
  createRuleEmail,
  createRulePassword
} from "src/components/sign/validator"
import { app } from "src/modules/firebase"
import { ref } from "vue"
import { useRouter } from "vue-router"

const auth = getAuth(app)

const $q = useQuasar()
const router = useRouter()

const firstName = ref("")
const lastName = ref("")
const email = ref("")
const password = ref("")

const ruleFirstName = createRuleLength(1, 15, "first name")
const ruleLastName = createRuleLength(1, 15, "last name")
const ruleEmail = createRuleEmail()
const rulePassword = createRulePassword()

const signUp = async (event: FormDataEvent) => {
  event.preventDefault()

  const data = new FormData(event.currentTarget)
  console.log({
    email: data.get("email"),
    password: data.get("password")
  })

  try {
    const { user } = await createUserWithEmailAndPassword(
      auth,
      data.get("email") as string,
      data.get("password") as string
    )
    await updateProfile(user, {
      displayName: `${data.get("firstName")} ${data.get("lastName")}`
    })

    console.log(user)

    $q.notify(`Sign up successfully! Hello ${user.displayName}`)
    router.push("/sign-in")
  } catch (err) {
    console.log(err)
    const error = err as AuthError
    $q.notify(`Sign up failed: ${error.message}`)
  }
}
</script>
