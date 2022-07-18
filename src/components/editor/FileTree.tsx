import ChevronRight from "@mui/icons-material/ChevronRight"
import ContentCopy from "@mui/icons-material/ContentCopy"
import ContentCut from "@mui/icons-material/ContentCut"
import ContentPaste from "@mui/icons-material/ContentPaste"
import CreateNewFolderOutlined from "@mui/icons-material/CreateNewFolderOutlined"
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline"
import NoteAddOutlined from "@mui/icons-material/NoteAddOutlined"
import Divider from "@mui/material/Divider"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import MenuItem from "@mui/material/MenuItem"
import Typography from "@mui/material/Typography"
import { basename, dirname, join } from "path-browserify"
import { useEffect, useState } from "react"

import getIcon from "../../assets/extensions/material-icon-theme/dist/getIcon"
import { editorStore } from "../../store/editor"
import type { FS } from "../../type/FS"

import { RenameFileOrDir } from "./components/RenameFileOrDir"
import { createContextMenu } from "./create/createContextMenu"
import { sortListFiles } from "./utils/sortListFiles"

// eslint-disable-next-line functional/no-mixed-type
interface OptionFile {
  isFolder: false
  filepath: string

  fs: FS

  onRename: (value: string) => void
}

interface OptionDir extends Omit<OptionFile, "isFolder"> {
  isFolder: true
  notShowRoot?: boolean

  header?: JSX.Element
}

function File(props: Omit<OptionFile, "isDir">) {
  const filename = basename(props.filepath)

  const [renaming, setRenaming] = useState(false)
  const [loading, setLoading] = useState(false)

  // =========== actions =============
  async function rename(newFileName: string) {
    const newPath = join(dirname(props.filepath), newFileName)

    setLoading(true)
    await props.fs.rename(props.filepath, newPath)
    setLoading(false)

    props.onRename(newPath)
  }
  // ================================

  // =========== context menu =============
  const { ContextMenu, openContextMenu, closeContextMenu } = createContextMenu()
  // ======================================

  return (
    <li
      className="mb-1.5 ml-[10px]"
      onClick={() => {
        editorStore.actions.setCurrentFileEdit(props.filepath)
      }}
      onContextMenu={openContextMenu}
    >
      {loading && <IconEosIconsLoading className="w-[1.25rem] h-[1.25rem]" />}

      <div
        className={
          "flex items-center" +
          (loading ? "" : " ml-20px") +
          (renaming ? " hidden" : "")
        }
      >
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
        <MenuItem dense>
          <ListItemIcon>
            <ContentCut fontSize="small" />
          </ListItemIcon>
          <ListItemText>Cut</ListItemText>
          <Typography variant="body2" color="text.secondary">
            ⌘X
          </Typography>
        </MenuItem>
        <MenuItem dense>
          <ListItemIcon>
            <ContentCopy fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy</ListItemText>
          <Typography variant="body2" color="text.secondary">
            ⌘C
          </Typography>
        </MenuItem>
        <MenuItem dense>
          <ListItemIcon>
            <ContentPaste fontSize="small" />
          </ListItemIcon>
          <ListItemText>Paste</ListItemText>
          <Typography variant="body2" color="text.secondary">
            ⌘V
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            closeContextMenu()
            setRenaming(true)
          }}
        >
          <ListItemIcon>
            <DriveFileRenameOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
          <Typography variant="body2" color="text.secondary">
            F2
          </Typography>
        </MenuItem>
      </ContextMenu>
    </li>
  )
}
function Dir(props: Omit<OptionDir, "isDir">) {
  const { filepath, fs, notShowRoot } = props

  const filename = basename(filepath)

  const [isOpen, setIsOpen] = useState(notShowRoot ?? false)
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

  // =========== actions =============
  async function rename(newFileName: string) {
    const newPath = join(dirname(filepath), newFileName)

    setLoading(true)
    await fs.rename(filepath, newPath)
    setLoading(false)

    props.onRename(newPath)
  }
  async function createNewFile(newFileName: string, isDir: boolean) {
    const newPath = join(dirname(filepath), newFileName)

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
  // =================================

  useEffect(() => {
    if (isOpen && !readiedDir && !readingDir) {
      // load filesDir
      setReadingDir(true) // --- reading ----
      setFilesDir([])
      // eslint-disable-next-line promise/catch-or-return
      fs.readdir(filepath)
        // eslint-disable-next-line promise/always-return
        .then(async (files) => {
          setReadingDir(false)
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
          setReadingDir(false)
          console.warn(err)
        })
        .finally(() => {
          setReadiedDir(true)
        })
    }
  }, [isOpen])

  // =========== context menu =============
  const { ContextMenu, openContextMenu, closeContextMenu } = createContextMenu()
  // ======================================

  return (
    <>
      {props.notShowRoot && props.header && (
        <div className="flex items-center justify-between ml-[22px] mr-[7px] py-1">
          {props.header}
          <div className="text-[1.1rem] flex items-center">
            <NoteAddOutlined
              fontSize="inherit"
              className="mr-1 cursor-pointer"
              onClick={() => {
                setAdding({
                  filepath: "",
                  isDir: false
                })
              }}
            />
            <CreateNewFolderOutlined
              fontSize="inherit"
              className="cursor-pointer"
              onClick={() => {
                setAdding({
                  filepath: "",
                  isDir: true
                })
              }}
            />
          </div>
        </div>
      )}
      <li
        className="select-none ml-[10px]"
        onClick={(event) => {
          event.stopPropagation()
          setIsOpen(!isOpen)
        }}
        onContextMenu={openContextMenu}
      >
        {!notShowRoot && (
          <>
            <div
              className={
                "flex items-center mb-1.5" + (renaming ? " hidden" : "")
              }
            >
              {!readingDir && (
                <ChevronRight
                  fontSize="small"
                  className={isOpen ? " rotate-90" : ""}
                />
              )}
              {(readingDir || loading) && (
                <IconEosIconsLoading className="w-[1.25rem] h-[1.25rem]" />
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
              <span className="text-[14px] ml-2 ellipsis">{filename}</span>
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
          <MenuItem
            onClick={() => {
              closeContextMenu()
              setIsOpen(true)
              setAdding({
                isDir: false,
                filepath: ""
              })
            }}
          >
            <ListItemIcon>
              <NoteAddOutlined fontSize="small" />
            </ListItemIcon>
            <ListItemText>New File</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              closeContextMenu()
              setIsOpen(true)
              setAdding({
                isDir: true,
                filepath: ""
              })
            }}
          >
            <ListItemIcon>
              <CreateNewFolderOutlined fontSize="small" />
            </ListItemIcon>
            <ListItemText>New Folder</ListItemText>
          </MenuItem>

          <Divider />

          <MenuItem dense>
            <ListItemIcon>
              <ContentCut fontSize="small" />
            </ListItemIcon>
            <ListItemText>Cut</ListItemText>
            <Typography variant="body2" color="text.secondary">
              ⌘X
            </Typography>
          </MenuItem>
          <MenuItem dense>
            <ListItemIcon>
              <ContentCopy fontSize="small" />
            </ListItemIcon>
            <ListItemText>Copy</ListItemText>
            <Typography variant="body2" color="text.secondary">
              ⌘C
            </Typography>
          </MenuItem>
          <MenuItem dense>
            <ListItemIcon>
              <ContentPaste fontSize="small" />
            </ListItemIcon>
            <ListItemText>Paste</ListItemText>
            <Typography variant="body2" color="text.secondary">
              ⌘V
            </Typography>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              closeContextMenu()
              setRenaming(true)
            }}
          >
            <ListItemIcon>
              <DriveFileRenameOutlineIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Rename</ListItemText>
            <Typography variant="body2" color="text.secondary">
              F2
            </Typography>
          </MenuItem>
        </ContextMenu>

        <ul className={isOpen ? "" : "hidden"}>
          {(adding ? sortListFiles([adding, ...filesDir]) : filesDir).map(
            ({ filepath, isDir }, index) => {
              if (filepath === "") {
                // create new

                // adding file or folder
                return (
                  <RenameFileOrDir
                    key={`new-dir-${isDir}`}
                    className="ml-[10px]"
                    isDir={isDir}
                    siblings={filesDir.map(({ filepath }) =>
                      basename(filepath)
                    )}
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
                        filesDir.splice(index, 1, {
                          filepath: join(dirname(filepath), event),
                          isDir
                        })
                      )
                    )
                  }}
                />
              )
            }
          )}
        </ul>
      </li>
    </>
  )
}

export function FileTree(options: OptionDir | OptionFile) {
  return (
    <ul>{options.isFolder ? <Dir {...options} /> : <File {...options} />}</ul>
  )
}

export function FileTreeNoRoot(
  options: Omit<OptionDir, "onRename" | "isFolder">
) {
  return (
    <ul>
      <Dir {...(options as OptionDir)} isFolder notShowRoot />
    </ul>
  )
}
