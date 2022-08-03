import { KEY_DIFF_OBJECT_MIXED } from "./const"
import type { DiffMixed } from "./types"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isDiffMixed(obj: any): obj is DiffMixed {
  return obj && KEY_DIFF_OBJECT_MIXED in obj
}
