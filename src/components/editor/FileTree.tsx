import { basename, join } from "path-browserify"
import { useEffect, useState } from "preact/hooks"

import getIcon from "../../assets/extensions/material-icon-theme/dist/getIcon"

interface OptionDir {
  isFolder: true
  filepath: string

  isChildren?: boolean
  notShowRoot?: boolean

  fs: {
    readdir: (filepath: string) => Promise<string[]>
    lstat: (filepath: string) => Promise<{
      isDirectory: () => boolean
    }>
  }
}
interface OptionFile {
  isFolder: false
  filepath: string
}

function file(filepath: string) {
  return (
    <li class="flex items-center pb-1.5 pl-[19.19px]">
      <img
        class="w-[1.2rem] h-[1.2rem]"
        src={getIcon({
          light: false,
          isFolder: false,
          isOpen: false,
          filepath
        })}
      ></img>
      <span class="text-[14px] ml-2">{basename(filepath)}</span>
    </li>
  )
}
function dir(filepath: string, fs: OptionDir["fs"], notShowRoot?: boolean) {
  const [isOpen, setIsOpen] = useState(false)
  const [readingDir, setReadingDir] = useState(false)

  interface FileDirItem {
    filepath: string
    isDir: boolean
  }
  const [filesDir, setFilesDir] = useState<FileDirItem[]>([])

  const [readiedDir, setReadiedDir] = useState(false)
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

  const treeChildren = (
    <ul class={isOpen ? "" : "hidden"}>
      {filesDir.map(({ filepath, isDir }) => {
        return (
          <FileTree
            key={filepath}
            isFolder={isDir}
            filepath={filepath}
            fs={fs}
          />
        )
      })}
    </ul>
  )

  // eslint-disable-next-line multiline-ternary
  return !notShowRoot ? (
    <li
      class="select-none ml-[19.19px]"
      onClick={(event) => {
        event.stopPropagation()
        setIsOpen(!isOpen)
      }}
    >
      <div class="flex items-center pb-1.5">
        {!readingDir &&
          // eslint-disable-next-line multiline-ternary
          (isOpen ? (
            <IconBxChevronDown class="w-[19.19px] h-[19.19px]" />
          ) : (
            <IconBxChevronRight class="w-[19.19px] h-[19.19px]" />
          ))}
        {readingDir && <IconEosIconsLoading class="w-[19.19px] h-[19.19px]" />}
        <img
          class="w-[1.2rem] h-[1.2rem]"
          src={getIcon({
            light: false,
            isFolder: true,
            isOpen: readiedDir && isOpen,
            filepath
          })}
        ></img>
        <span class="text-[14px] ml-2 ellipsis">{basename(filepath)}</span>
      </div>

      {treeChildren}
    </li>
  ) : (
    <li class="select-none ml-[19.19px]">{treeChildren}</li>
  )
}

export function FileTree(options: OptionDir | OptionFile) {
  return options.isFolder
    ? dir(options.filepath, options.fs, options.notShowRoot)
    : file(options.filepath)
}
