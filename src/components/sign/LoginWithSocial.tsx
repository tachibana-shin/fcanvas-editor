import { Icon } from "@iconify/react"
import Button from "@mui/material/Button"

export function LoginWithSocial() {
  return (
    <>
      <div className="text-center text-sm my-4 relative before:content-DEFAULT before:absolute before:left-0 before:top-[50%] before:w-full before:h-[1px] before:bg-[rgba(255,255,255,0.1)]">
        <span className="bg-[#121212] px-1 relative z-2 text-gray-400">or</span>
      </div>

      <div className="text-center">
        <Button
          color="inherit"
          className="w-full max-w-[350px] !normal-case !bg-dark-500"
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
