import FileSystem from "@isomorphic-git/lightning-fs"

export const fs = new FileSystem("model").promises

if (import.meta.env.NODE_ENV !== "production") {
  // eslint-disable-next-line functional/immutable-data
  ;(window as unknown as any).fs = fs
}

export type FS = typeof fs
