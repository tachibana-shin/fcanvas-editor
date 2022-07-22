import "./Header.scss"

import { getAuth } from "@firebase/auth"
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined"
import PersonIcon from "@mui/icons-material/Person"
import SettingsIcon from "@mui/icons-material/Settings"
import SourceOutlinedIcon from "@mui/icons-material/SourceOutlined"
import Avatar from "@mui/material/Avatar"
import Divider from "@mui/material/Divider"
import Fade from "@mui/material/Fade"
import Link from "@mui/material/Link"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import MenuItem from "@mui/material/MenuItem"
import MenuList from "@mui/material/MenuList"
import Popover from "@mui/material/Popover"
import Typography from "@mui/material/Typography"
import * as React from "react"
import { useState } from "react"

import { app } from "~/modules/firebase"
import { useToast } from "~/plugins/toast"
import { useUserStore } from "~/store/user"

function Btn(props: {
  label: string | JSX.Element
  href?: string
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void
  onMouseLeave?: (event: React.MouseEvent<HTMLButtonElement>) => void
}) {
  if (props.href) {
    return (
      <Link
        className="px-[10px] py-[12px] text-sm text-gray-300 hover:text-gray-100"
        href={props.href}
      >
        {props.label}
      </Link>
    )
  }

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
  label: string | JSX.Element
  menu: JSX.Element | JSX.Element[]
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
        aria-haspopup="true"
        onClick={open ? closeSubMenu : openSubMenu}
      />
      {
        <Popover
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
          disableAutoFocus
          disableRestoreFocus
        >
          {props.menu}
        </Popover>
      }
    </>
  )
}

function MenuListItems(props: {
  items: {
    name?: string
    icon?: JSX.Element
    sub?: string
    onClick?: () => void
    divider?: boolean
  }[]
}) {
  return (
    <MenuList dense className="text-sm min-w-[150px]">
      {props.items.map((item, index) => {
        if (item.divider) return <Divider key={index} />

        return (
          <MenuItem key={index} onClick={item.onClick}>
            {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
            <ListItemText>{item.name}</ListItemText>
            {item.sub && (
              <Typography variant="body2" color="text.secondary">
                {item.sub}
              </Typography>
            )}
          </MenuItem>
        )
      })}
    </MenuList>
  )
}

export function Header() {
  const [{ user }] = useUserStore()
  const auth = getAuth(app)
  const { addToast } = useToast()

  return (
    <header className="h-[42px] w-full top-0 left-0 flex items-center px-3">
      <NavItem
        label="File"
        menu={
          <MenuListItems
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
        }
      />
      <NavItem
        label="Edit"
        menu={
          <MenuListItems
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
        }
      />
      <Btn label="Sketch" />
      <Btn label="Help" />

      <div className="flex-1"></div>

      <Btn label="English" />
      {/* eslint-disable-next-line multiline-ternary */}
      {user ? (
        <NavItem
          label={
            <div className="flex items-center">
              <Avatar
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                alt={user.displayName!}
                src={user.photoURL ?? undefined}
                sx={{ width: 24, height: 24 }}
              />
            </div>
          }
          menu={
            <>
              <div className="text-center min-w-[250px]">
                <Avatar // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  alt={user.displayName!}
                  src={user.photoURL ?? undefined}
                  sx={{ width: 80, height: 80 }}
                  className="mt-[20px] mx-auto"
                />

                <h3 className="text-[14px] mt-2">{user.displayName}</h3>
              </div>

              <MenuListItems
                items={[
                  {
                    name: "View Profile",
                    icon: <PersonIcon />,
                    onClick() {
                      console.log("View Profile")
                    }
                  },
                  {
                    name: "Edit Profile",
                    icon: <SettingsIcon />,
                    onClick() {
                      console.log("Edit Profile")
                    }
                  },
                  {
                    name: "Assets",
                    icon: <SourceOutlinedIcon />,
                    onClick() {
                      console.log("Assets")
                      addToast("assets")
                    }
                  },
                  {
                    divider: true
                  },
                  {
                    name: "Sign Out",
                    icon: <LogoutOutlinedIcon />,
                    onClick: () => {
                      auth.signOut()
                      addToast("Sign outed!")
                    }
                  }
                ]}
              />
            </>
          }
        />
      ) : (
        <>
          <Btn label="Login in" href="/sign-in" />
          <span className="text-gray-300 text-[12px]">or</span>
          <Btn label="Sign up" href="/sign-up" />
        </>
      )}
    </header>
  )
}
