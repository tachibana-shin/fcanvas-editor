import esbuildWASM from "esbuild-wasm"
import esbuildDotWASM from "esbuild-wasm/esbuild.wasm?url"
import { extname, join } from "path-browserify"
import { InMemoryFS } from "src/libs/InMemoryFS"

export const fs = new InMemoryFS()

if (import.meta.env.NODE_ENV !== "production") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as unknown as any).fs = fs
}

export type FS = typeof fs

export function createBlobURL(content: string) {
  return URL.createObjectURL(new Blob([content]))
}

const fileURLObjectMap = new Map<string, string>()
// free memory
fs.events.on("write", (file) => {
  // clean
  fileURLObjectMap.forEach((url, path) => {
    if (isPathChange(file, path)) {
      // cancel

      URL.revokeObjectURL(url)
      fileURLObjectMap.delete(path)
    }
  })
})
export async function getBlobURLOfFile(path: string): Promise<string> {
  const inM = fileURLObjectMap.get(path)
  if (inM) return inM
  // wji
  const url = createBlobURL(await complier(await fs.readFile(path), path))

  fileURLObjectMap.set(path, url)

  return url
}
export function isPathChange(parent: string, filepath: string) {
  parent = join("/", parent)
  filepath = join("/", filepath)
  return (
    filepath === parent || filepath.startsWith(`${parent}/`) || parent === "/"
  )
}

esbuildWASM.initialize({
  wasmURL: esbuildDotWASM
})
async function complier(content: string, filename: string): Promise<string> {
  switch (extname(filename)) {
    case ".ts":
      return (
        await esbuildWASM.transform(content, {
          loader: "ts"
        })
      ).code
  }

  return content
}

export function watchFile(filepath: string, cb: (exists: boolean) => void) {
  const handlerWrite = (file: string) => {
    // eslint-disable-next-line n/no-callback-literal
    if (isPathChange(file, filepath)) cb(true)
  }
  const handlerUnlink = (file: string) => {
    // eslint-disable-next-line n/no-callback-literal
    if (isPathChange(file, filepath)) cb(false)
  }

  fs.events.on("write", handlerWrite)
  fs.events.on("unlink", handlerUnlink)
  return () => {
    fs.events.off("write", handlerWrite)
    fs.events.off("unlink", handlerUnlink)
  }
}
