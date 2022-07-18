import "./Header.scss"

import Cloud from "@mui/icons-material/Cloud"
import ContentCopy from "@mui/icons-material/ContentCopy"
import ContentCut from "@mui/icons-material/ContentCut"
import Divider from "@mui/material/Divider"
import Fade from "@mui/material/Fade"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import MenuItem from "@mui/material/MenuItem"
import MenuList from "@mui/material/MenuList"
import Popover from "@mui/material/Popover"
import Typography from "@mui/material/Typography"
import * as React from "react"
import { useState } from "react"

function Btn(props: {
  label: string
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void
  onMouseLeave?: (event: React.MouseEvent<HTMLButtonElement>) => void
}) {
  return (
    <button
      className="px-[10px] py-[12px] text-sm text-gray-300 hover:text-gray-100"
      onClick={props.onClick}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
    >
      {props.label}
    </button>
  )
}

function NavItem(props: {
  label: string
  items: {
    name: string
    sub?: string
  }[]
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  const openSubMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const closeSubMenu = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

  return (
    <>
      <Btn
        label={props.label}
        aria-owns={open ? "mouse-over-popover_" + props.label : undefined}
        aria-haspopup="true"
        onClick={open ? closeSubMenu : openSubMenu}
        onMouseEnter={openSubMenu}
        onMouseLeave={closeSubMenu}
      />
      {
        <Popover
          id={"mouse-over-popover_" + props.label}
          open={open}
          anchorEl={anchorEl}
          onClose={closeSubMenu}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left"
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left"
          }}
          TransitionComponent={Fade}
          sx={{
            pointerEvents: "none"
          }}
          disableAutoFocus
          disableRestoreFocus
        >
          <MenuList>
            <MenuItem>
              <ListItemIcon>
                <ContentCut fontSize="small" />
              </ListItemIcon>
              <ListItemText>Cut</ListItemText>
              <Typography variant="body2" color="text.secondary">
                ⌘X
              </Typography>
            </MenuItem>
            <MenuItem>
              <ListItemIcon>
                <ContentCopy fontSize="small" />
              </ListItemIcon>
              <ListItemText>Copy</ListItemText>
              <Typography variant="body2" color="text.secondary">
                ⌘C
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem>
              <ListItemIcon>
                <Cloud fontSize="small" />
              </ListItemIcon>
              <ListItemText>Web Clipboard</ListItemText>
            </MenuItem>
          </MenuList>
        </Popover>
      }
    </>
  )
}

export function Header() {
  return (
    <header className="h-[42px] w-full top-0 left-0 flex items-center px-3">
      <NavItem
        label="File"
        items={[
          {
            name: "New"
          },
          {
            name: "Save",
            sub: "⌃+S"
          },
          {
            name: "Examples"
          }
        ]}
      />
      <NavItem
        label="Edit"
        items={[
          {
            name: "Prettier"
          },
          {
            name: "Find"
          },
          {
            name: "Replace"
          }
        ]}
      />
      <Btn label="Sketch" />
      <Btn label="Help" />

      <div className="flex-1"></div>

      <Btn label="English" />
      <Btn label="Login in" />
      <span className="text-gray-300 text-[12px]">or</span>
      <Btn label="Sign up" />
    </header>
  )
}
