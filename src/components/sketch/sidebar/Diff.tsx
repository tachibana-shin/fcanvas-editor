import ChevronRight from "@mui/icons-material/ChevronRight"
import LinearProgress from "@mui/material/LinearProgress"
import type {
  DiffReturn,
  Diff as DiffValueType
} from "@tachibana-shin/diff-object"
import { isDiffObject, KEY_ACTION } from "@tachibana-shin/diff-object"
import { useEffect, useState } from "react"

import { CLASS_PATH_ACTIVE } from "./components/FileTree"

import getIcon from "~/assets/extensions/material-icon-theme/dist/getIcon"
import { fs } from "~/modules/fs"
import { useStoreState } from "~/stores"
import { useSaveSketch } from "~/useActions/editor-actions"

const FILE_COLOR = {
  ADDED: " text-green-500",
  MODIFIED: " text-orange-600",
  DELETED: " text-red-600"
}
function File(props: { name: string; type: "ADDED" | "MODIFIED" | "DELETED" }) {
  return (
    <div className="py-[3px] pl-[10px] cursor-pointer">
      <div
        className={
          "flex items-center pl-20px " +
          CLASS_PATH_ACTIVE +
          FILE_COLOR[props.type]
        }
      >
        <img
          className="w-[1.2rem] h-[1.2rem]"
          src={getIcon({
            light: false,
            isFolder: false,
            isOpen: false,
            filepath: props.name
          })}
        ></img>
        <span className="text-[14px] pl-2 w-full truncate">{props.name}</span>
        <small className="pr-1.5">{props.type[0]}</small>
      </div>
    </div>
  )
}
function Dir(props: {
  name: string
  show?: true
  files: DiffValueType<false>
}) {
  const [isOpen, setIsOpen] = useState(props.show ?? false)

  return (
    <div className={"select-none cursor-pointer pl-[10px]"}>
      {props.show || (
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
      )}

      <div className={isOpen ? "" : "hidden"}>
        {Object.entries(props.files).map(([name, diff]) => {
          const isFile = isDiffObject(diff, false)

          if (isFile) {
            return (
              <File
                key={name}
                name={name}
                type={
                  (diff as unknown as DiffValueType<false>)[
                    KEY_ACTION
                  ] as unknown as "ADDED" | "MODIFIED" | "DELETED"
                }
              />
            )
          }

          return <Dir key={name} name={name} files={diff} />
        })}
      </div>
    </div>
  )
}

export function Diff() {
  const [loading, setLoading] = useState(false)
  const [diff, setDiff] = useState<DiffReturn<false> | null>(null)

  const saveSketch = useSaveSketch()

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

  if (!acceptDiff) {
    return (
      <div className="w-full px-3">
        <small className="leading-0">
          Diff change not active. Please login and save sketch.
        </small>

        <button
          className="block w-full max-w-[250px] mt-1 mb-3 text-sm py-[3px] mx-auto bg-cyan-600"
          onClick={saveSketch}
        >
          Save Sketch
        </button>
      </div>
    )
  }

  return (
    <div className="w-full">
      {loading && (
        <div className="w-100 absolute top-0 left-0">
          <LinearProgress
            color="inherit"
            sx={{
              height: 2
            }}
          />
        </div>
      )}

      {(!diff || diff.count === 0) && (
        <div className="text-center text-sm mt-3">Not change</div>
      )}

      {diff && (
        <>
          <div
            className="block max-w-[250px] mt-1 mb-3 text-sm py-[3px] text-center bg-cyan-600 cursor-pointer"
            onClick={async () => {
              setLoading(true)
              await saveSketch()
              setDiff(null)
              setLoading(false)
            }}
          >
            Save Sketch
          </div>
          <small className="text-[14px] block border-y border-gray-600 py-1 px-3">
            Changes
          </small>
          <div className="ml-[-15px] mt-2">
            <Dir show name="/" files={diff.diffs} />
          </div>
        </>
      )}
    </div>
  )
}
