import micromatch from "micromatch"
import { fs } from "src/modules/fs"

export async function fastGlob(patterns: string[], ignore: string[]) {
  return micromatch(
    await fs.readFiles(),
    patterns.length > 0 ? patterns : ["*"],
    {
      ignore
    }
  )
}
