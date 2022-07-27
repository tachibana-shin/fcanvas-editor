import type { AuthError } from "@firebase/auth"
import {
  getAuth,
  signInWithEmailAndPassword
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
import { useMemo, useState } from "react"

import { Copyright } from "~/components/sign/Copyright"
import { LoginWithSocial } from "~/components/sign/LoginWithSocial"
import {
  createRuleEmail,
  createRulePassword,
  validator
} from "~/components/sign/validator"
import { app } from "~/modules/firebase"
import { useToast } from "~/plugins/toast"

export function SignIn(): JSX.Element {
  const auth = getAuth(app)
  // connectAuthEmulator(
  //   auth,
  //   "https://9099-tachibanash-fcanvasedit-sezqurpgd2w.ws-us54.gitpod.io"
  // )
  const { addToast } = useToast()

  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setShowError(true)

    if (!validation.passed) return

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

      addToast(`Logged in as ${user.displayName}`)
    } catch (err) {
      console.log(err)
      const error = err as AuthError
      addToast(`Login failed: ${error.message}`)
    }
  }

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [showError, setShowError] = useState(false)

  const validation = useMemo(
    () =>
      validator(
        {
          email,
          password
        },
        {
          email: createRuleEmail(),
          password: createRulePassword()
        }
      ),
    [email, password]
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
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box component="form" onSubmit={signIn} noValidate sx={{ mt: 1 }}>
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
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            error={showError && !!validation.errors.password}
            helperText={validation.errors.password}
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
            Sign In
          </Button>

          <LoginWithSocial />

          <Grid container sx={{ mt: 5 }}>
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
          </Grid>
        </Box>
      </Box>
      <Copyright sx={{ mt: 8, mb: 4 }} />
    </Container>
  )
}
