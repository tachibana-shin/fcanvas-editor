import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined"
import Checkbox from "@mui/material/Checkbox"
import Fab from "@mui/material/Fab"
import { useState } from "react"

import { InputAutoFocus } from "../ui/InputAutoFocus"

function Rename(props: {
  defaultValue: string
  onSave: (newValue: string) => void
  onBlur: () => void
}) {
  const [tmpName, setTmpName] = useState(props.defaultValue)

  return (
    <InputAutoFocus
      value={tmpName}
      className="text-[14px] bg-gray-800 rounded py-1 px-2 mx-[-8px] hover:text-[#d9d9d9] focus-visible:outline-none"
      onInput={({ target }) => {
        setTmpName((target as HTMLInputElement).value)
      }}
      onBlur={props.onBlur}
    />
  )
}

export function ToolBar() {
  const [renaming, setRenaming] = useState(false)

  const reamer = (
    <div
      className="flex items-center ml-7 text-[#d9d9d9] text-[12px] cursor-pointer hover:text-green-400"
      onClick={() => setRenaming(true)}
    >
      {!renaming && (
        <span className="text-[14px] bg-transparent">Hello fCanvas</span>
      )}
      {!renaming && <IconBxEditAlt className="ml-1" />}

      {renaming && (
        <Rename
          defaultValue="Hello fCanvas"
          onSave={() => {}}
          onBlur={() => setRenaming(false)}
        />
      )}
    </div>
  )
  return (
    <div className="flex items-center px-4 py-[10px] text-white  border-y border-dotted">
      <Fab color="primary" size="small">
        <PlayArrowIcon />
      </Fab>

      <div className="flex items-center text-[#d9d9d9] text-[14px] ml-2">
        <Checkbox size="small" />
        <span className="ml-1">Auto-refresh</span>
      </div>

      {reamer}

      <div className="flex-1"></div>

      <Fab className="!bg-gray-600 !text-gray-300" size="small">
        <SettingsOutlinedIcon />
      </Fab>
    </div>
  )
}
