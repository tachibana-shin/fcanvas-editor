import type { AuthError, AuthProvider } from "@firebase/auth"
import { getAuth, GithubAuthProvider, GoogleAuthProvider, signInWithPopup } from "@firebase/auth"
import { Icon } from "@iconify/react"
import Button from "@mui/material/Button"

import { app } from "~/modules/firebase"
import { useToast } from "~/plugins/toast"

const googleProvider = new GoogleAuthProvider()
const githubProvider = new GithubAuthProvider()

export function LoginWithSocial() {
  const { addToast } = useToast()

  async function loginWith(provider: AuthProvider) {
    const auth = getAuth(app)

    try {
      const { user } = await signInWithPopup(auth, provider)

      console.log(user)

      addToast(`Logged in as ${user.displayName}`)
    } catch (err) {
      console.log(err)
      const error = err as AuthError
      addToast(`Login failed: ${error.message}`)
    }
  }

  return (
    <>
      <div className="text-center text-sm my-4 relative before:content-DEFAULT before:absolute before:left-0 before:top-[50%] before:w-full before:h-[1px] before:bg-[rgba(255,255,255,0.1)]">
        <span className="bg-[#121212] px-1 relative z-2 text-gray-400">or</span>
      </div>

      <div className="text-center">
        <Button
          color="inherit"
          className="w-full max-w-[350px] !normal-case !bg-dark-500"
          onClick={() => loginWith(googleProvider)}
        >
          <Icon
            icon="flat-color-icons:google"
            width="1.5rem"
            height="1.5rem"
            className="mr-1"
          />
          Sign in with Google
        </Button>
        <Button
          color="inherit"
          className="!mt-2 w-full max-w-[350px] !normal-case !bg-dark-500"
          onClick={() => loginWith(githubProvider)}
        >
          <Icon
            icon="uiw:github"
            width="1.5rem"
            height="1.5rem"
            className="mr-1"
          />
          Sign in with GitHub
        </Button>
      </div>
    </>
  )
}
