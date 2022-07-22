import { Icon } from "@iconify/react"
import ChevronRight from "@mui/icons-material/ChevronRight"
import ContentCopy from "@mui/icons-material/ContentCopy"
import ContentCut from "@mui/icons-material/ContentCut"
import ContentPaste from "@mui/icons-material/ContentPaste"
import CreateNewFolderOutlined from "@mui/icons-material/CreateNewFolderOutlined"
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined"
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline"
import FolderDeleteOutlinedIcon from "@mui/icons-material/FolderDeleteOutlined"
import NoteAddOutlined from "@mui/icons-material/NoteAddOutlined"
import { basename, dirname, join } from "path-browserify"
import type { MutableRefObject } from "react"
import { useEffect, useImperativeHandle, useMemo, useState } from "react"

import { RenameFileOrDir } from "./components/RenameFileOrDir"
import { createContextMenu } from "./create/createContextMenu"
import { sortListFiles } from "./utils/sortListFiles"
import { splice } from "./utils/splice"

import getIcon from "~/assets/extensions/material-icon-theme/dist/getIcon"
import { createMenuItems } from "~/creators/createMenuItems"
import type { FS } from "~/type/FS"

export interface FuncShared {
  createFile: () => Promise<void>
  createDir: () => Promise<void>
  reloadDir: () => Promise<void>
}
interface OptionFile {
  filepath: string

  show?: true

  fs: FS

  onRename: (value: string) => void
  onUnlink: () => void
}

interface OptionDir extends OptionFile {
  funcSharedRef?: MutableRefObject<FuncShared | void>
}

function File(props: Omit<OptionFile, "isDir">) {
  const filename = useMemo(() => basename(props.filepath), [props.filepath])

  const [renaming, setRenaming] = useState(false)
  const [loading, setLoading] = useState(false)

  // =========== actions =============
  async function rename(newFileName: string) {
    const newPath = join(dirname(props.filepath), newFileName)

    console.log("rename %s => %s", props.filepath, newPath)

    setLoading(true)
    await props.fs.rename(props.filepath, newPath)
    setLoading(false)

    props.onRename(newPath)
  }
  async function unlink() {
    setLoading(true)
    await props.fs.unlink(props.filepath)

    props.onUnlink()
  }
  // ================================

  // =========== context menu =============
  const { ContextMenu, openContextMenu, closeContextMenu } = createContextMenu()
  // ======================================

  return (
    <div className="mb-1.5 ml-[10px]">
      <div
        className={"flex items-center ml-20px" + (renaming ? " hidden" : "")}
        onContextMenu={openContextMenu}
      >
        {loading && (
          <Icon
            icon="eos-icons:loading"
            className="w-[1.25rem] h-[1.25rem] ml-[-1.25rem]"
          />
        )}
        <img
          className="w-[1.2rem] h-[1.2rem]"
          src={getIcon({
            light: false,
            isFolder: false,
            isOpen: false,
            filepath: props.filepath
          })}
        ></img>
        <span className="text-[14px] ml-2">{filename}</span>
      </div>

      {renaming && (
        <RenameFileOrDir
          isDir={false}
          defaultValue={filename}
          onSave={rename}
          onBlur={() => {
            setRenaming(false)
          }}
        />
      )}

      <ContextMenu>
        {createMenuItems([
          {
            icon: <ContentCut fontSize="small" />,
            name: "Cut",
            sub: "⌘X"
          },
          {
            icon: <ContentCopy fontSize="small" />,
            name: "Copy",
            sub: "⌘C"
          },
          {
            icon: <ContentPaste fontSize="small" />,
            name: "Paste",
            sub: "⌘V"
          },
          {
            divider: true
          },
          {
            icon: <DriveFileRenameOutlineIcon fontSize="small" />,
            name: "Rename",
            sub: "F2",
            onClick() {
              closeContextMenu()
              setRenaming(true)
            }
          },
          {
            icon: <DeleteOutlinedIcon fontSize="small" />,
            name: "Delete",
            sub: "Delete",
            onClick() {
              closeContextMenu()
              unlink()
            }
          }
        ])}
      </ContextMenu>
    </div>
  )
}
function Dir(props: Omit<OptionDir, "isDir">) {
  const { filepath, fs } = props

  const filename = useMemo(() => basename(filepath), [filepath])

  const [isOpen, setIsOpen] = useState(props.show ?? false)
  const [readingDir, setReadingDir] = useState(false)
  const [loading, setLoading] = useState(false)

  interface FileDirItem {
    filepath: string
    isDir: boolean
  }
  const [filesDir, setFilesDir] = useState<FileDirItem[]>([])
  const [readiedDir, setReadiedDir] = useState(false)

  const [renaming, setRenaming] = useState(false)
  const [adding, setAdding] = useState<null | FileDirItem>(null)

  if (props.funcSharedRef) {
    useImperativeHandle(props.funcSharedRef, () => ({
      createFile,
      createDir,
      reloadDir
    }))
  }
  // =========== actions =============
  async function rename(newFileName: string) {
    const newPath = join(dirname(filepath), newFileName)

    console.log("rename %s => %s", filepath, newPath)

    setLoading(true)
    await fs.rename(filepath, newPath)
    setLoading(false)

    props.onRename(newPath)
  }
  async function createNewFile(newFileName: string, isDir: boolean) {
    const newPath = join(filepath, newFileName)

    setLoading(true)
    if (isDir) await fs.mkdir(newPath)
    else await fs.writeFile(newPath, "")
    setLoading(false)

    setFilesDir(
      sortListFiles([
        ...filesDir,
        {
          filepath: newPath,
          isDir
        }
      ])
    )
  }
  async function reloadDir() {
    await fs
      .readdir(filepath)
      // eslint-disable-next-line promise/always-return
      .then(async (files) => {
        setFilesDir(
          sortListFiles(
            await Promise.all(
              files.map(async (name) => {
                const path = join(filepath, name)

                const isDir = (await fs.lstat(path)).isDirectory()

                return {
                  filepath: path,
                  isDir
                }
              })
            )
          )
        )
      })
      .catch((err) => {
        console.warn(err)
      })
      .finally(() => {
        setReadingDir(false)
        setReadiedDir(true)
      })
  }
  async function unlink() {
    setLoading(true)
    await props.fs.unlink(props.filepath)

    props.onUnlink()
  }
  async function createFile() {
    setIsOpen(true)
    setAdding({
      filepath: "",
      isDir: false
    })
  }
  async function createDir() {
    setIsOpen(true)
    setAdding({
      filepath: "",
      isDir: true
    })
  }
  // =================================

  useEffect(() => {
    if (isOpen && !readiedDir && !readingDir) {
      // load filesDir
      setReadingDir(true) // --- reading ----
      setFilesDir([])
      reloadDir()
    }
  }, [isOpen])

  // =========== context menu =============
  const { ContextMenu, openContextMenu, closeContextMenu } = createContextMenu()
  // ======================================

  return (
    <div
      className="select-none ml-[10px]"
      onClick={
        props.show
          ? undefined
          : (event) => {
              event.stopPropagation()
              setIsOpen(!isOpen)
            }
      }
    >
      {props.show || (
        <>
          <div
            className={"flex items-center mb-1.5" + (renaming ? " hidden" : "")}
            onContextMenu={openContextMenu}
          >
            {!readingDir && (
              <ChevronRight
                fontSize="small"
                className={
                  (isOpen ? "transform rotate-90" : "") +
                  (loading ? " hidden" : "")
                }
              />
            )}
            {(readingDir || loading) && (
              <Icon
                icon="eos-icons:loading"
                className="w-[1.25rem] h-[1.25rem]"
              />
            )}
            <img
              className="w-[1.2rem] h-[1.2rem]"
              src={getIcon({
                light: false,
                isFolder: true,
                isOpen: readiedDir && isOpen,
                filepath
              })}
            ></img>
            <span className="text-[14px] ml-2 truncate">{filename}</span>
          </div>
          {renaming && (
            <RenameFileOrDir
              isDir
              defaultValue={filename}
              onSave={rename}
              onBlur={() => {
                setRenaming(false)
              }}
            />
          )}
        </>
      )}

      <ContextMenu>
        {createMenuItems([
          {
            icon: <NoteAddOutlined fontSize="small" />,
            name: "New File",
            onClick() {
              closeContextMenu()
              createFile()
            }
          },
          {
            icon: <CreateNewFolderOutlined fontSize="small" />,
            name: "New Folder",
            onClick() {
              closeContextMenu()
              createDir()
            }
          },
          {
            divider: true
          },
          {
            icon: <ContentCut fontSize="small" />,
            name: "Cut",
            sub: "⌘X"
          },
          {
            icon: <ContentCopy fontSize="small" />,
            name: "Copy",
            sub: "⌘C"
          },
          {
            icon: <ContentPaste fontSize="small" />,
            name: "Paste",
            sub: "⌘V"
          },
          {
            divider: true
          },
          {
            icon: <DriveFileRenameOutlineIcon fontSize="small" />,
            name: "Rename",
            sub: "F2",
            onClick() {
              closeContextMenu()
              setRenaming(true)
            }
          },
          {
            icon: <FolderDeleteOutlinedIcon fontSize="small" />,
            name: "Delete",
            sub: "Delete",
            onClick() {
              closeContextMenu()
              unlink()
            }
          }
        ])}
      </ContextMenu>

      <div className={isOpen ? "" : "hidden"}>
        {(adding ? sortListFiles([adding, ...filesDir]) : filesDir).map(
          (item) => {
            const { filepath, isDir } = item

            if (filepath === "") {
              // create new

              // adding file or folder
              return (
                <RenameFileOrDir
                  key={`new-dir-${isDir}`}
                  className="ml-[10px]"
                  isDir={isDir}
                  siblings={filesDir.map(({ filepath }) => basename(filepath))}
                  onSave={(value) => {
                    createNewFile(value, isDir)
                  }}
                  onBlur={() => setAdding(null)}
                />
              )
            }

            return (
              <FileTree
                key={filepath}
                isFolder={isDir}
                filepath={filepath}
                fs={fs}
                onRename={(event) => {
                  setFilesDir(
                    sortListFiles(
                      splice(filesDir, filesDir.indexOf(item) >>> 0, {
                        filepath: join(dirname(filepath), event),
                        isDir
                      })
                    )
                  )
                }}
                onUnlink={() => {
                  setFilesDir(
                    sortListFiles(
                      splice(filesDir, filesDir.indexOf(item) >>> 0)
                    )
                  )
                }}
              />
            )
          }
        )}
      </div>
    </div>
  )
}

export function FileTree(
  options: (OptionDir | OptionFile) & {
    isFolder: boolean
  }
) {
  return options.isFolder ? <Dir {...options} /> : <File {...options} />
}

export function FileTreeNoRoot(
  options: Omit<OptionDir, "onRename" | "onUnlink">
) {
  return <Dir funcSharedRef={options.funcSharedRef} {...(options as OptionDir)} show />
}
