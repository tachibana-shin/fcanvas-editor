import { KEY_ACTION, KEY_VALUEA, KEY_VALUEB } from "@tachibana-shin/diff-object"

import { CHAR_KEEP } from "./CHAR_KEEP"
import { isDirectory } from "./isDirectory"
import type { Diff, Directory } from "./types"

export function markDiff(
  dir: Directory,
  isDeleted?: true
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
        [KEY_VALUEA]: obj,
        [KEY_VALUEB]: undefined
      }
    else
      diffs[name] = {
        [KEY_ACTION]: "ADDED",
        [KEY_VALUEA]: undefined,
        [KEY_VALUEB]: obj
      }
    count++
  }

  return {
    diffs,
    count
  }
}
