import { Icon } from "@iconify/react"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined"
import Checkbox from "@mui/material/Checkbox"
import Fab from "@mui/material/Fab"
import { InputAutoFocus } from "components/ui/InputAutoFocus"
import gen from "project-name-generator"
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"

function Rename(props: {
  defaultValue: string
  onSave: (newValue: string) => void
  onBlur: () => void
}): JSX.Element {
  const [inputName, setInputName] = useState(props.defaultValue ?? "")

  return (
    <InputAutoFocus
      value={inputName}
      className="text-[14px] bg-gray-800 rounded py-1 px-2 mx-[-8px] hover:text-[#d9d9d9] focus-visible:outline-none"
      onInput={(event) =>
        setInputName((event.target as HTMLInputElement).value)
      }
      onBlur={() => {
        if (inputName !== "" && inputName !== props.defaultValue)
          props.onSave(inputName)

        props.onBlur?.()
      }}
      onKeyDown={(event) => {
        if ((event as unknown as KeyboardEvent).key === "Enter") {
          if (inputName !== "") {
            ;(event.target as HTMLInputElement).blur()
          }
        }
      }}
    />
  )
}

export function ToolBar() {
  const dispatch = useDispatch()

  const [name, setName] = useState(
    () =>
      gen({
        words: 2,
        alliterative: true
      }).spaced
  )

  useEffect(() => {
    dispatch({
      type: "editor/setSketchName",
      payload: name
    })
  }, [name])

  const [renaming, setRenaming] = useState(false)

  const reamer = (
    <div
      className="flex items-center ml-7 text-[#d9d9d9] text-[12px] cursor-pointer hover:text-green-400"
      onClick={() => setRenaming(true)}
    >
      {!renaming && <span className="text-[14px] bg-transparent">{name}</span>}
      {!renaming && <Icon icon="bx:edit-alt" className="ml-1" />}

      {renaming && (
        <Rename
          defaultValue={name}
          onSave={setName}
          onBlur={() => setRenaming(false)}
        />
      )}
    </div>
  )
  return (
    <div className="flex items-center px-4 py-[10px] text-white  border-y border-gray-700 border-dotted">
      <Fab color="primary" size="small">
        <PlayArrowIcon />
      </Fab>

      <div className="flex items-center text-[#d9d9d9] text-[14px] ml-2">
        <Checkbox size="small" />
        <span className="ml-1">Auto-refresh</span>
      </div>

      {reamer}

      <div className="flex-1"></div>

      <Fab className="!bg-dark-600 !text-gray-300" size="small">
        <SettingsOutlinedIcon />
      </Fab>
    </div>
  )
}
