import type { AuthError } from "@firebase/auth"
import { getAuth, sendPasswordResetEmail } from "@firebase/auth"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import MarkEmailReadRoundedIcon from "@mui/icons-material/MarkEmailReadRounded"
import Avatar from "@mui/material/Avatar"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import Link from "@mui/material/Link"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { useMemo, useState } from "react"

import { Copyright } from "~/components/sign/Copyright"
import { LoginWithSocial } from "~/components/sign/LoginWithSocial"
import { createRuleEmail, validator } from "~/components/sign/validator"
import { app } from "~/modules/firebase"
import { useToast } from "~/plugins/toast"

export function ForgotPassword(): JSX.Element {
  const auth = getAuth(app)
  // connectEmulator(auth, connectAuthEmulator, 9099)
  const { addToast } = useToast()

  const [reseted, setReseted] = useState(false)

  const resetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setShowError(true)

    if (!validation.passed) return

    const data = new FormData(event.currentTarget)

    console.log({
      email: data.get("email")
    })

    try {
      await sendPasswordResetEmail(auth, data.get("email") as string)

      setReseted(true)
    } catch (err) {
      console.log(err)
      const error = err as AuthError
      addToast(`Reset password failed: ${error.message}`)
    }
  }

  const [email, setEmail] = useState("")

  const [showError, setShowError] = useState(false)

  const validation = useMemo(
    () =>
      validator(
        {
          email
        },
        {
          email: createRuleEmail()
        }
      ),
    [email]
  )

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        {!reseted && (
          <>
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Reset your Password
            </Typography>
          </>
        )}

        {reseted && (
          <Box
            sx={{
              mt: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
            className="text-center"
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <MarkEmailReadRoundedIcon />
            </Avatar>

            <Typography variant="subtitle1">
              You will receive a password recovery link at your email address in
              a few minutes. Please check your mailbox
            </Typography>
          </Box>
        )}

        <Box
          component="form"
          onSubmit={resetPassword}
          noValidate
          sx={{ mt: 1 }}
        >
          {!reseted && (
            <>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                onChange={(e) => setEmail(e.target.value)}
                error={showError && !!validation.errors.email}
                helperText={validation.errors.email}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3 }}
              >
                Reset Password
              </Button>

              <LoginWithSocial />
            </>
          )}

          <Grid container sx={{ mt: 5 }}>
            <Grid item xs>
              <Link href="/forgot-password" variant="body2">
                Already have login and password? Sign In
              </Link>
            </Grid>
            <Grid item>
              <Link href="/sign-up" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Copyright sx={{ mt: 8, mb: 4 }} />
    </Container>
  )
}
