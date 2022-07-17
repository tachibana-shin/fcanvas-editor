import { useState } from "preact/hooks"

import { Button } from "../ui/Button"

export function ToolBar() {
  const [renaming, setRenaming] = useState(false)

  const reamer = (
    <div
      class="flex items-center ml-7 text-[#d9d9d9] text-[12px] cursor-pointer hover:text-green-400"
      onClick={() => setRenaming(true)}
    >
      {!renaming && (
        <span class="text-[14px] bg-transparent">Hello fCanvas</span>
      )}
      {!renaming && <IconBxEditAlt class="ml-1" />}

      <input
        value="Hello fCanvas"
        class={
          "text-[14px] bg-gray-800 rounded py-1 px-2 hover:text-[#d9d9d9] " +
          (renaming ? "" : "hidden")
        }
        autofocus
        onBlur={() => setRenaming(false)}
      ></input>
    </div>
  )
  return (
    <div class="flex items-center px-4 py-[10px] text-white  border-y border-dotted">
      <Button class="w-[40px] h-[40px] rounded-1/2 text-[16px] bg-green-600 flex items-center justify-center">
        <IconBiPlayFill />
      </Button>
      <div class="flex items-center text-[#d9d9d9] text-[14px] ml-2">
        <input type="checkbox"></input>
        <span class="ml-1">Auto-refresh</span>
      </div>

      {reamer}

      <div class="flex-1"></div>

      <Button class="w-[40px] h-[40px] rounded-1/2 text-[16px] bg-gray-600 flex items-center justify-center">
        <IconUilSetting />
      </Button>
    </div>
  )
}
