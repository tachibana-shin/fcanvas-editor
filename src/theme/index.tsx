import type { LinkProps } from "@mui/material/Link"
import { createTheme } from "@mui/material/styles"
import { forwardRef } from "react"
import type { LinkProps as RouterLinkProps } from "react-router-dom"
import { Link as RouterLink } from "react-router-dom"

const LinkBehavior = forwardRef<
  HTMLAnchorElement,
  Omit<RouterLinkProps, "to"> & { href: RouterLinkProps["to"] }
>((props, ref) => {
  const { href, ...other } = props
  // Map href (MUI) -> to (react-router)
  return <RouterLink ref={ref} to={href} {...other} />
})

export const darkTheme = createTheme({
  palette: {
    mode: "dark"
  },
  components: {
    MuiLink: {
      defaultProps: {
        component: LinkBehavior
      } as LinkProps
    },
    MuiButtonBase: {
      defaultProps: {
        LinkComponent: LinkBehavior
      }
    }
  }
})
