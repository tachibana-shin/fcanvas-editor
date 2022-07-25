import Menu from "@mui/material/Menu"
import React, { useState } from "react"

export function createContextMenu() {
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number
    mouseY: number
  } | null>(null)

  const openContextMenu = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6
          }
        : null
    )
  }
  const closeContextMenu = () => {
    setContextMenu(null)
  }

  const ContextMenu = (props: {
    children: JSX.Element[]
  }) => (
    <Menu
      open={contextMenu !== null}
      onClose={closeContextMenu}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenu !== null
          ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
          : undefined
      }
      variant="menu"
      MenuListProps={{
        dense: true
      }}
      onClick={(event) => {
        event.stopPropagation()
      }}
      disableAutoFocus
      disableRestoreFocus
    >
      {props.children}
    </Menu>
  )

  return {
    ContextMenu,
    openContextMenu,
    closeContextMenu
  }
}
