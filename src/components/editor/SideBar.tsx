import { Icon } from "@iconify/react"
import CreateNewFolderOutlined from "@mui/icons-material/CreateNewFolderOutlined"
import NoteAddOutlined from "@mui/icons-material/NoteAddOutlined"
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined"
import type { editor } from "monaco-editor"
import { Resizable } from "re-resizable"
import { useRef, useState } from "react"

import type { FuncShared } from "./sidebar/FileTree"
import { FileTreeNoRoot } from "./sidebar/FileTree"

import { fs } from "~/modules/fs"

export function SideBar(props: {
  editorRef: ReturnType<
    typeof useRef<editor.ICodeEditor | editor.IStandaloneCodeEditor>
  >
}) {
  const { editorRef } = props

  const fileTreeRef = useRef<FuncShared>()

  const [tabSelection, setTabSelection] = useState<
    null | "file" | "search" | "change" | "setting"
  >("file")
  const tabs: {
    icon: string
    value: Exclude<typeof tabSelection, null>
  }[] = [
    {
      icon: "codicon:files",
      value: "file"
    },
    {
      icon: "codicon:search",
      value: "search"
    },
    {
      icon: "codicon:request-changes",
      value: "change"
    },
    {
      icon: "codicon:settings-gear",
      value: "setting"
    }
  ]

  return (
    <>
      <div className="flex flex-col items-center flex-nowrap border-r border-gray-700">
        {tabs.map(({ icon, value }) => {
          return (
            <button
              key={value}
              className={
                "w-[48px] h-[48px] text-gray-500 hover:text-gray-400" +
                (tabSelection === value ? " !text-inherit" : "")
              }
              onClick={() => {
                if (tabSelection === value) setTabSelection(null)
                else setTabSelection(value)
              }}
            >
              <Icon icon={icon} className="w-[24px] h-[24px]" />
            </button>
          )
        })}
      </div>

      <Resizable
        defaultSize={{
          width: "220px",
          height: "100%"
        }}
        maxWidth="60%"
        minWidth="1"
        enable={{
          top: false,
          right: true,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false
        }}
        onResize={() =>
          editorRef.current?.layout({} as unknown as editor.IDimension)
        }
        className={tabSelection !== null ? undefined : "hidden"}
      >
        <div className="pl-3 pt-1 h-full border-r border-gray-700 overflow-x-hidden">
          <div className="ml-[-27px]">
            <div className="flex items-center justify-between ml-[22px] mr-[7px] py-1">
              <h1 className="text-[12px] uppercase font-bold">FCanvas</h1>
              <div className="text-[1.1rem] flex items-center children:mr-1 children:cursor-pointer">
                <NoteAddOutlined
                  fontSize="inherit"
                  onClick={() => fileTreeRef.current?.createFile()}
                />
                <CreateNewFolderOutlined
                  fontSize="inherit"
                  onClick={() => fileTreeRef.current?.createDir()}
                />
                <ReplayOutlinedIcon
                  fontSize="inherit"
                  onClick={() => fileTreeRef.current?.reloadDir()}
                />
              </div>
            </div>

            <FileTreeNoRoot funcSharedRef={fileTreeRef} filepath="/" fs={fs} />
          </div>
        </div>
      </Resizable>
    </>
  )
}
