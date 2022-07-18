import Container from "@mui/material/Container"
import CssBaseline from "@mui/material/CssBaseline"
import { Route, Routes } from "react-router-dom"

import { Header } from "./components/app/Header"
import { Index } from "./pages/Index"
import { SignIn } from "./pages/SignIn"
import { SignUp } from "./pages/SignUp"

export function App() {
  return (
    <>
      <Header />
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
        </Routes>
      </Container>
    </>
  )
}
