import Router from "preact-router"

import { Header } from "./components/app/Header"
import { ToolBar } from "./components/app/ToolBar"
import { Index } from "./pages/Index"

export function App() {
  return (
    <>
      <Header />
      <ToolBar />
      <Router>
        <Index path="/" />
      </Router>
    </>
  )
}
