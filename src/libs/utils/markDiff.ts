import { CHAR_KEEP , KEY_ACTION, KEY_OLD_VALUE } from "./const"
import { isDirectory } from "./isDirectory"
import type { Diff, Directory } from "./types"

export function markDiff(
  dir: Directory,
  isDeleted?: boolean
): {
  diffs: Diff
  count: number
} {
  const diffs: Diff = {}
  // eslint-disable-next-line functional/no-let
  let count = 0

  for (const name in dir) {
    if (name === CHAR_KEEP) continue

    const obj = dir[name]

    if (isDirectory(obj)) {
      const diff = markDiff(obj, isDeleted)

      diffs[name] = diff.diffs
      count += diff.count

      continue
    }

    if (isDeleted)
      diffs[name] = {
        [KEY_ACTION]: "DELETED",
        [KEY_OLD_VALUE]: obj
      }
    else
      diffs[name] = {
        [KEY_ACTION]: "ADDED"
      }
    count++
  }

  return {
    diffs,
    count
  }
}
