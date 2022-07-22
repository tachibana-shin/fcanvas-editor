import "./Header.scss"

import { getAuth } from "@firebase/auth"
import { Icon } from "@iconify/react"
import ChevronRight from "@mui/icons-material/ChevronRight"
import CreateNewFolderOutlined from "@mui/icons-material/CreateNewFolderOutlined"
import FileOpenOutlinedIcon from "@mui/icons-material/FileOpenOutlined"
import FindReplaceOutlinedIcon from "@mui/icons-material/FindReplaceOutlined"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import KeyboardCommandKeyOutlinedIcon from "@mui/icons-material/KeyboardCommandKeyOutlined"
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined"
import NoteAddOutlinedIcon from "@mui/icons-material/NoteAddOutlined"
import PersonIcon from "@mui/icons-material/Person"
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined"
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined"
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined"
import SettingsIcon from "@mui/icons-material/Settings"
import SourceOutlinedIcon from "@mui/icons-material/SourceOutlined"
import StopIcon from "@mui/icons-material/Stop"
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
import { useState } from "react"
import type { MouseEvent } from "react"

import { app } from "~/modules/firebase"
import { useToast } from "~/plugins/toast"
import { useUserStore } from "~/store/user"

function Btn(props: {
  label: string | JSX.Element
  href?: string
  noChevron?: boolean
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  onMouseEnter?: (event: MouseEvent<HTMLButtonElement>) => void
  onMouseLeave?: (event: MouseEvent<HTMLButtonElement>) => void
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
      className="flex items-center px-[10px] py-[12px] text-sm text-gray-300 hover:text-gray-100"
      onClick={props.onClick}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
    >
      {props.label}
      {props.noChevron || (
        <ChevronRight fontSize="small" className="transform rotate-90" />
      )}
    </button>
  )
}

function NavItem(props: {
  label: string | JSX.Element
  noChevron?: boolean
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
        noChevron={props.noChevron}
        aria-haspopup="true"
        onClick={open ? closeSubMenu : openSubMenu}
      />
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
              <Typography variant="body2" color="text.secondary" ml={2}>
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
                icon: <NoteAddOutlinedIcon />,
                name: "New Project"
              },
              {
                icon: <SaveOutlinedIcon />,
                name: "Save",
                sub: "⌘S"
              },
              {
                icon: <FileOpenOutlinedIcon />,
                name: "Open"
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
                icon: <Icon icon="file-icons:prettier" />,
                name: "Prettier",
                sub: "⌘↑+F"
              },
              {
                icon: <SearchOutlinedIcon />,
                name: "Find",
                sub: "⌘F"
              },
              {
                icon: <FindReplaceOutlinedIcon />,
                name: "Replace",
                sub: "⌘H"
              }
            ]}
          />
        }
      />
      <NavItem
        label="Sketch"
        menu={
          <MenuListItems
            items={[
              {
                icon: <NoteAddOutlinedIcon />,
                name: "Add File"
              },
              {
                icon: <CreateNewFolderOutlined />,
                name: "Add Folder"
              },
              {
                icon: <PlayArrowOutlinedIcon />,
                name: "Run",
                sub: "⌘H"
              },
              {
                icon: <StopIcon />,
                name: "⌘Enter",
                sub: "⌘↑+Enter"
              }
            ]}
          />
        }
      />
      <NavItem
        label="Help"
        menu={
          <MenuListItems
            items={[
              {
                icon: <KeyboardCommandKeyOutlinedIcon />,
                name: "Keyboard Shortcuts"
              },
              {
                name: "Reference"
              },
              {
                icon: <InfoOutlinedIcon />,
                name: "About"
              }
            ]}
          />
        }
      />

      <div className="flex-1"></div>

      <Btn label="English" href="#" />
      {/* eslint-disable-next-line multiline-ternary */}
      {user ? (
        <NavItem
          noChevron
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
