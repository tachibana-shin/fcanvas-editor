import { Outlet } from "react-router"

import { Header } from "~/components/app/Header"

export function LayoutDefault() {
  return (
    <>
      <Header />

      <Outlet />
    </>
  )
}
