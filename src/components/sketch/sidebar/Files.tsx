import CreateNewFolderOutlined from "@mui/icons-material/CreateNewFolderOutlined"
import NoteAddOutlined from "@mui/icons-material/NoteAddOutlined"
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined"
import { useRef } from "react"

import type { FuncShared } from "./components/FileTree"
import { FileTreeNoRoot } from "./components/FileTree"

import { fs } from "~/modules/fs"

export function Files() {
  const fileTreeRef = useRef<FuncShared>()

  return (
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
  )
}
