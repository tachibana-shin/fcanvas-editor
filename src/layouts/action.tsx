import { Outlet } from "react-router"

import { Header } from "~/components/app/Header"

export function LayoutAction() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}
