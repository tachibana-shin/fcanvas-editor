import FileSystem from "@isomorphic-git/lightning-fs"

import type { FS } from "~/type/FS"

export const fs: FS = new FileSystem("model").promises

if (import.meta.env.NODE_ENV !== "production") {
  // eslint-disable-next-line functional/immutable-data
  ;(window as unknown as any).fs = fs
}
