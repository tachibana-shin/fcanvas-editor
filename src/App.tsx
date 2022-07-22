import Container from "@mui/material/Container"
import CssBaseline from "@mui/material/CssBaseline"
import { Navigate, Route, Routes, useLocation } from "react-router"

import { Header } from "./components/app/Header"
import { ForgotPassword } from "./pages/ForgotPassword"
import { Index } from "./pages/Index"
import { SignIn } from "./pages/SignIn"
import { SignUp } from "./pages/SignUp"
import { useUserStore } from "./store/user"

export function App() {
  return (
    <>
      <Header />
      <Container component="main" className="!px-0">
        <CssBaseline />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route
            path="/sign-in"
            element={
              <Guest>
                <SignIn />
              </Guest>
            }
          />
          <Route
            path="/sign-up"
            element={
              <Guest>
                <SignUp />
              </Guest>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <Guest>
                <ForgotPassword />
              </Guest>
            }
          />
        </Routes>
      </Container>
    </>
  )
}

function Guest(props: { children: JSX.Element }) {
  const [userStore] = useUserStore()
  const location = useLocation()

  if (userStore.user) {
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
