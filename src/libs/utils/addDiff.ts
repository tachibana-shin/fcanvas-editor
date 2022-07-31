import { isDiffObject } from "./isDiffObject"
import type { Diff, DiffObject } from "./types"

export const DIFF_OBJECT_MIXED = "#@~!diffObjMixed"
export const DIFF_DIFF_MIXED = "#@~!diffDiffMixed"

export function addDiff(
  diff: Diff,
  name: string,
  obj: DiffObject | Diff
): boolean {
  if (!diff[name]) {
    diff[name] = obj
    return true
  }

  if (!isDiffObject(diff[name])) {
    diff[name] = {
      [DIFF_OBJECT_MIXED]: diff[name],
      [DIFF_DIFF_MIXED]: obj
    }
    return true
  }

  return false
}
