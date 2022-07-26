import { InMemoryFS } from "~/libs/InMemoryFS"

export const fs = new InMemoryFS()

if (import.meta.env.NODE_ENV !== "production") {
  // eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
  ;(window as unknown as any).fs = fs
}

export type FS = typeof fs

export function createBlobURL(content: string) {
  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  return URL.createObjectURL(new Blob([content]))
}

const fileURLObjectMap = new Map<string, string>()
// free memory
fs.events.on("writeFile", (file) => {
  // clean
  fileURLObjectMap.forEach((url, path) => {
    if (file === path || path.startsWith(`${file}/`)) {
      // cancel
      // eslint-disable-next-line n/no-unsupported-features/node-builtins
      URL.revokeObjectURL(url)
      fileURLObjectMap.delete(path)
    }
  })
})
export async function getBlobURLOfFile(path: string): Promise<string> {
  const inM = fileURLObjectMap.get(path)
  if (inM) return inM
  // wji
  const url = createBlobURL(await fs.readFile(path))

  fileURLObjectMap.set(path, url)

  return url
}
