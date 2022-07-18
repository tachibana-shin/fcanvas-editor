import FileSystem from "@isomorphic-git/lightning-fs"

import type { FS } from "../type/FS"

export const fs: FS = new FileSystem("model").promises
