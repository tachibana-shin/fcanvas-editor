import ChevronRight from "@mui/icons-material/ChevronRight"
import ContentCopy from "@mui/icons-material/ContentCopy"
import ContentCut from "@mui/icons-material/ContentCut"
import ContentPaste from "@mui/icons-material/ContentPaste"
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder"
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline"
import NoteAddIcon from "@mui/icons-material/NoteAdd"
import { ThemeProvider } from "@mui/material"
import Divider from "@mui/material/Divider"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import Typography from "@mui/material/Typography"
import { basename, dirname, join } from "path-browserify"
import { useEffect, useState } from "react"

import getIcon from "../../assets/extensions/material-icon-theme/dist/getIcon"
import { darkTheme } from "../../darkTheme"
import { editorStore } from "../../store/editor"
import type { FS } from "../../type/FS"

import { RenameFileOrDir } from "./components/RenameFileOrDir"
import { sortListFiles } from "./utils/sortListFiles"

// eslint-disable-next-line functional/no-mixed-type
interface OptionDir {
  isFolder: true
  filepath: string

  isChildren?: boolean
  notShowRoot?: boolean

  fs: FS

  onRename: (value: string) => void
}
// eslint-disable-next-line functional/no-mixed-type
interface OptionFile {
  isFolder: false
  filepath: string
  onRename: (value: string) => void
}

function File(props: { filepath: string }) {
  return (
    <li
      className="flex items-center mb-1.5 ml-[30px]"
      onClick={() => {
        editorStore.actions.setCurrentFileEdit(props.filepath)
      }}
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
      <span className="text-[14px] ml-2">{basename(props.filepath)}</span>
    </li>
  )
}
function Dir(props: {
  filepath: string
  fs: OptionDir["fs"]
  notShowRoot?: boolean
  onRename: OptionDir["onRename"]
}) {
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

  const [contextMenu, setContextMenu] = useState<{
    mouseX: number
    mouseY: number
  } | null>(null)

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6
          }
        : null
    )
  }

  const handleClose = () => {
    setContextMenu(null)
  }

  return (
    <li
      className="select-none ml-[10px]"
      onClick={(event) => {
        event.stopPropagation()
        setIsOpen(!isOpen)
      }}
      onContextMenu={handleContextMenu}
    >
      {!notShowRoot && (
        <>
          <div
            className={"flex items-center mb-1.5" + (renaming ? " hidden" : "")}
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

      <ThemeProvider theme={darkTheme}>
        <Menu
          open={contextMenu !== null}
          onClose={handleClose}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
          variant="menu"
          MenuListProps={{
            dense: true
          }}
          onClick={(event) => {
            event.stopPropagation()
          }}
        >
          <MenuItem
            onClick={() => {
              setContextMenu(null)
              setIsOpen(true)
              setAdding({
                isDir: false,
                filepath: ""
              })
            }}
          >
            <ListItemIcon>
              <NoteAddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>New File</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setContextMenu(null)
              setIsOpen(true)
              setAdding({
                isDir: true,
                filepath: ""
              })
            }}
          >
            <ListItemIcon>
              <CreateNewFolderIcon fontSize="small" />
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
              setContextMenu(null)
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
        </Menu>
      </ThemeProvider>

      <ul className={isOpen ? "" : "hidden"}>
        {[...(adding ? [adding] : []), ...filesDir].map(
          ({ filepath, isDir }, index) => {
            if (filepath === "") {
              // create new

              // adding file or folder
              return (
                <RenameFileOrDir
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
  )
}

export function FileTree(options: OptionDir | OptionFile) {
  if (options.isFolder) {
    return (
      <Dir
        filepath={options.filepath}
        fs={options.fs}
        notShowRoot={options.notShowRoot}
        onRename={options.onRename}
      />
    )
  }

  return <File filepath={options.filepath} />
}
