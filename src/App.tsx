import { getAuth, onAuthStateChanged } from "@firebase/auth"
import Container from "@mui/material/Container"
import CssBaseline from "@mui/material/CssBaseline"
import { useDispatch } from "react-redux"
import { Navigate, Route, Routes, useLocation } from "react-router"

import { LayoutAction } from "./layouts/action"
import { LayoutDefault } from "./layouts/default"
import { app } from "./modules/firebase"
import { ForgotPassword } from "./pages/ForgotPassword"
import { Index } from "./pages/Index"
import { SignIn } from "./pages/SignIn"
import { SignUp } from "./pages/SignUp"
import { useStoreState } from "./stores"

// eslint-disable-next-line functional/no-let
let subscribeAuthChange: () => void
export function App() {
  const auth = getAuth(app)
  const dispatch = useDispatch()

  subscribeAuthChange?.()
  subscribeAuthChange = onAuthStateChanged(auth, (user) => {
    console.log(user)
    dispatch({
      type: "auth/setUser",
      payload: user
        ? {
            photoURL: user.photoURL,
            email: user.email,
            displayName: user.displayName,
            isAnonymous: user.isAnonymous,
            providerId: user.providerId
          }
        : null
    })
  })

  return (
    <Container component="main" className="!px-0">
      <CssBaseline />

      <Routes>
        <Route path="/" element={<LayoutDefault />}>
          <Route path="" element={<Index />} />
        </Route>

        <Route path="/" element={<LayoutAction />}>
          <Route
            path="sign-in"
            element={
              <Guest>
                <SignIn />
              </Guest>
            }
          />
          <Route
            path="sign-up"
            element={
              <Guest>
                <SignUp />
              </Guest>
            }
          />
          <Route
            path="forgot-password"
            element={
              <Guest>
                <ForgotPassword />
              </Guest>
            }
          />
        </Route>
      </Routes>
    </Container>
  )
}

function Guest(props: { children: JSX.Element }) {
  const location = useLocation()

  if (useStoreState().auth.user) {
    return (
      <Navigate
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        to={(location.state as unknown as any)?.from?.pathname ?? "/"}
        replace
      />
    )
  }

  return props.children
}
