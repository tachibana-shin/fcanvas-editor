import Container from "@mui/material/Container"
import CssBaseline from "@mui/material/CssBaseline"
import { Route, Routes } from "react-router"

import { Header } from "./components/app/Header"
import { ForgotPassword } from "./pages/ForgotPassword"
import { Index } from "./pages/Index"
import { SignIn } from "./pages/SignIn"
import { SignUp } from "./pages/SignUp"

export function App() {
  return (
    <>
      <Header />
      <Container component="main" className="!px-0">
        <CssBaseline />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </Container>
    </>
  )
}
