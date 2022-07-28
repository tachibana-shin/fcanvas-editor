import { Icon } from "@iconify/react"
import type { editor } from "monaco-editor"
import { Resizable } from "re-resizable"
import type { useRef } from "react"
import { useState } from "react"

import { Diff } from "./sidebar/Diff"
import { Files } from "./sidebar/Files"

export function SideBar(props: {
  editorRef: ReturnType<
    typeof useRef<editor.ICodeEditor | editor.IStandaloneCodeEditor>
  >
}) {
  const { editorRef } = props

  const [tabSelection, setTabSelection] = useState<
    null | "file" | "search" | "change" | "setting"
  >("change")
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
        <div className="pt-1 h-full border-r border-gray-700 overflow-x-hidden">
          {tabSelection === "file" && <Files />}
          {tabSelection === "change" && <Diff />}
        </div>
      </Resizable>
    </>
  )
}
