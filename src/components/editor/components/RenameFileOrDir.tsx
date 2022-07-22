import ChevronRight from "@mui/icons-material/ChevronRight"
import { InputAutoFocus } from "components/ui/InputAutoFocus"
import { useEffect, useState } from "react"

import getIcon from "~/assets/extensions/material-icon-theme/dist/getIcon"

function checkErrorFileName(
  fileName: string,
  siblings: string[],
  skipEmpty: boolean
) {
  if (fileName === "") {
    return skipEmpty
      ? undefined
      : {
          type: "error",
          message: "A file or folder name must be provided."
        }
  }

  if (siblings.includes(fileName)) {
    return {
      type: "error",
      message: (
        <span>
          File or folder <span className="font-bold">{fileName}</span> already
          exists at this location.
        </span>
      )
    }
  }

  if (fileName === "." || fileName === "..") {
    return {
      type: "error",
      message: (
        <span>
          The name <span className="font-bold">{fileName}</span> is not a valid
          as file or directory. Please select a different file name.
        </span>
      )
    }
  }

  if (fileName[0] === "/" || fileName[0] === "\\") {
    return {
      type: "error",
      message: "A file or folder name cannot start with a slash."
    }
  }

  if (fileName[0] === " ") {
    return {
      type: "warn",
      message:
        "Leading or trailing whitespace detected in a file or folder name."
    }
  }

  if (/\\|\/|:|\*|\?|'|"\|/.test(fileName)) {
    return {
      type: "error",
      message: (
        <span>
          The name <span className="font-bold">{fileName}</span> is not a valid
          as file or folder name. Please select a different file name.
        </span>
      )
    }
  }
}

export function RenameFileOrDir(props: {
  isDir: boolean
  defaultValue?: string
  onSave: (value: string) => void
  onBlur?: () => void
  siblings?: string[]

  className?: string
}) {
  const [inputName, setInputName] = useState(props.defaultValue ?? "")

  const [skipEmptyFileName, setSkipEmptyFileName] = useState(true)

  useEffect(() => {
    if (inputName !== "") setSkipEmptyFileName(false)
  }, [inputName])

  const errorFileName = checkErrorFileName(
    inputName,
    props.siblings || [],
    skipEmptyFileName
  )

  return (
    <li
      className={
        "flex items-center mb-1.5 select-none " + (props.className ?? "")
      }
      onClick={(event) => event.stopPropagation()}
    >
      {props.isDir && <ChevronRight fontSize="small" />}

      <div className="absolute top-0 left-0 w-full h-full bg-[rgba(0,0,0,.5)]"></div>

      <div
        className={
          "flex items-center relative z-10" + (props.isDir ? "" : " ml-[20px]")
        }
      >
        <img
          className="w-[1.2rem] h-[1.2rem]"
          src={getIcon({
            light: false,
            isFolder: props.isDir,
            isOpen: false,
            filepath: inputName
          })}
        ></img>

        <InputAutoFocus
          value={inputName}
          onInput={(event) =>
            setInputName((event.target as HTMLInputElement).value)
          }
          onBlur={() => {
            if (
              !errorFileName &&
              inputName !== "" &&
              inputName !== props.defaultValue
            )
              props.onSave(inputName)

            props.onBlur?.()
          }}
          onKeyDown={(event) => {
            if ((event as unknown as KeyboardEvent).key === "Enter") {
              if (!errorFileName && inputName !== "") {
                ;(event.target as HTMLInputElement).blur()
              }
            }
          }}
          className={
            "bg-transparent text-[14px] ml-2 truncate w-full border focus-visible:outline-none" +
            (errorFileName
              ? errorFileName.type === "warn"
                ? " border-yellow-600"
                : " border-red-600"
              : " border-cyan-600")
          }
        />

        {errorFileName && (
          <div className="absolute pl-[1.7rem] w-full top-[100%]">
            <span
              className={
                "text-[12px] px-1 py-[5px] border border-top-none block w-full" +
                (errorFileName.type === "warn"
                  ? " bg-yellow-900 border-yellow-600"
                  : " bg-red-900 border-red-600")
              }
            >
              {errorFileName.message}
            </span>
          </div>
        )}
      </div>
    </li>
  )
}
