import micromatch from "micromatch"

import { fs } from "~/modules/fs"

export async function fastGlob(patterns: string[], ignore: string[]) {
  return micromatch(
    await fs.readFiles(),
    patterns.length > 0 ? patterns : ["*"],
    {
      ignore
    }
  )
}
