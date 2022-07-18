import { useState } from "react"

import { Button } from "../ui/Button"

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

      <input
        value="Hello fCanvas"
        className={
          "text-[14px] bg-gray-800 rounded py-1 px-2 hover:text-[#d9d9d9] " +
          (renaming ? "" : "hidden")
        }
        onBlur={() => setRenaming(false)}
      ></input>
    </div>
  )
  return (
    <div className="flex items-center px-4 py-[10px] text-white  border-y border-dotted">
      <Button className="w-[40px] h-[40px] rounded-1/2 text-[16px] bg-green-600 flex items-center justify-center">
        <IconBiPlayFill />
      </Button>
      <div className="flex items-center text-[#d9d9d9] text-[14px] ml-2">
        <input type="checkbox"></input>
        <span className="ml-1">Auto-refresh</span>
      </div>

      {reamer}

      <div className="flex-1"></div>

      <Button className="w-[40px] h-[40px] rounded-1/2 text-[16px] bg-gray-600 flex items-center justify-center">
        <IconUilSetting />
      </Button>
    </div>
  )
}
