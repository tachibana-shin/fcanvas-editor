import type { AuthError } from "@firebase/auth"
import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile
} from "@firebase/auth"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import Avatar from "@mui/material/Avatar"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Checkbox from "@mui/material/Checkbox"
import Container from "@mui/material/Container"
import FormControlLabel from "@mui/material/FormControlLabel"
import Grid from "@mui/material/Grid"
import Link from "@mui/material/Link"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { useState } from "react"

import { Copyright } from "~/components/sign/Copyright"
import { LoginWithSocial } from "~/components/sign/LoginWithSocial"
import { createSnackbar } from "~/components/sign/createSnackbar"
import {
  createRuleEmail,
  createRuleLength,
  createRulePassword,
  validator
} from "~/components/sign/validator"
import { app } from "~/modules/firebase"

export function SignUp() {
  const auth = getAuth(app)
  // connectEmulator(auth, connectAuthEmulator, 9099)

  const { openSnackbar, snackbar } = createSnackbar()

  const [agressTermsAndConditions, setAgressTermsAndConditions] =
    useState(false)

  const signUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setShowError(true)

    if (!validation.passed) return

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

      openSnackbar({
        type: "success",
        message: `Sign up successfully! Hello ${user.displayName}`
      })
    } catch (err) {
      console.log(err)
      const error = err as AuthError
      openSnackbar({
        type: "error",
        message: `Sign up failed: ${error.message}`
      })
    }
  }

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [showError, setShowError] = useState(false)

  const validation = validator(
    {
      firstName,
      lastName,
      email,
      password
    },
    {
      firstName: createRuleLength(1, 15, "first name"),
      lastName: createRuleLength(1, 15, "last name"),
      email: createRuleEmail(),
      password: createRulePassword()
    }
  )

  return (
    <Container component="main" maxWidth="xs">
      <Box
        maxWidth="xs"
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <Box component="form" noValidate onSubmit={signUp} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="given-name"
                name="firstName"
                required
                fullWidth
                id="firstName"
                label="First Name"
                autoFocus
                onChange={(e) => setFirstName(e.target.value)}
                error={showError && !!validation.errors.firstName}
                helperText={validation.errors.firstName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                onChange={(e) => setLastName(e.target.value)}
                error={showError && !!validation.errors.lastName}
                helperText={validation.errors.lastName}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                error={showError && !!validation.errors.email}
                helperText={validation.errors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                onChange={(e) => setPassword(e.target.value)}
                error={showError && !!validation.errors.password}
                helperText={validation.errors.password}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    value="agressTermsAndConditions"
                    color="primary"
                    onChange={({ target }) =>
                      setAgressTermsAndConditions(target.checked)
                    }
                  />
                }
                label="I agree with terms and conditions. The security policy of the website"
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={!agressTermsAndConditions}
          >
            Sign Up
          </Button>

          <LoginWithSocial />

          <Grid container sx={{ mt: 5 }} justifyContent="flex-end">
            <Grid item>
              <Link href="/sign-in" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Copyright sx={{ mt: 5 }} />

      {snackbar}
    </Container>
  )
}
