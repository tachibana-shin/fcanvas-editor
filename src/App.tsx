import Router from "preact-router"

import { Header } from "./components/app/Header"
import { Index } from "./pages/Index"

export function App() {
  return (
    <>
      <Header />
      <Router>
        <Index path="/" />
      </Router>
    </>
  )
}
