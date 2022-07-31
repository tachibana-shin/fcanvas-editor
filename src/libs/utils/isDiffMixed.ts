import { DIFF_OBJECT_MIXED } from "./addDiff"
import type { DiffMixed } from "./types"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isDiffMixed(obj: any): obj is DiffMixed {
  return DIFF_OBJECT_MIXED in obj
}
