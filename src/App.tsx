import { Route, Routes } from "react-router-dom"

import { Header } from "./components/app/Header"
import { Index } from "./pages/Index"

export function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Index />} />
      </Routes>
    </>
  )
}
