import ChevronRight from "@mui/icons-material/ChevronRight"
import type {
  DiffReturn,
  Diff as DiffValueType
} from "@tachibana-shin/diff-object"
import { isDiffObject } from "@tachibana-shin/diff-object"
import { useEffect, useState } from "react"

import { CLASS_PATH_ACTIVE } from "./components/FileTree"

import getIcon from "~/assets/extensions/material-icon-theme/dist/getIcon"
import { fs } from "~/modules/fs"
import { useStoreState } from "~/stores"

function File(props: { name: string }) {
  return (
    <div className="py-[3px] pl-[10px] cursor-pointer">
      <div className={"flex items-center pl-20px " + CLASS_PATH_ACTIVE}>
        <img
          className="w-[1.2rem] h-[1.2rem]"
          src={getIcon({
            light: false,
            isFolder: false,
            isOpen: false,
            filepath: props.name
          })}
        ></img>
        <span className="text-[14px] pl-2">{props.name}</span>
      </div>
    </div>
  )
}
function Dir(props: { name: string; show?: true; files: DiffValueType }) {
  const [isOpen, setIsOpen] = useState(props.show ?? false)

  return (
    <div className="select-none pl-[10px] cursor-pointer">
      <div
        className={`flex items-center mb-1.5 ${CLASS_PATH_ACTIVE}`}
        onClick={(event) => {
          event.stopPropagation()
          setIsOpen(!isOpen)
        }}
      >
        <ChevronRight
          fontSize="small"
          className={isOpen ? "transform rotate-90" : ""}
        />
        <img
          className="w-[1.2rem] h-[1.2rem]"
          src={getIcon({
            light: false,
            isFolder: true,
            isOpen,
            filepath: props.name
          })}
        ></img>
        <span className="text-[14px] pl-2 truncate">{props.name}</span>
      </div>

      <div className={isOpen ? "" : "hidden"}>
        {Object.entries(props.files).map(([name, diff]) => {
          const isFile = isDiffObject(diff)

          if (isFile) return <File key={name} name={name} />

          return <Dir key={name} name={name} files={diff} />
        })}
      </div>
    </div>
  )
}

export function Diff() {
  const [loading, setLoading] = useState(false)
  const [diff, setDiff] = useState<DiffReturn>()

  const acceptDiff = useStoreState().editor.sketchId !== null

  useEffect(() => {
    if (!acceptDiff) return

    const handle = async () => {
      setLoading(true)

      try {
        setDiff(await fs.getdiff())
      } catch (err) {
        console.log(err)
      }

      setLoading(false)
    }

    fs.events.on("write", handle)
    fs.events.on("unlink", handle)

    return () => {
      fs.events.off("write", handle)
      fs.events.off("unlink", handle)
    }
  }, [acceptDiff])

  return (
    <div className="w-full h-full">
      {JSON.stringify(
        {
          loading,
          diff,
          acceptDiff
        },
        null,
        2
      )}

      {diff && <Dir show name="/" files={diff.diffs} />}
    </div>
  )
}
