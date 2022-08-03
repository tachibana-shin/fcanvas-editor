import { KEY_ACTION } from "./const"
import type { DiffObject } from "./types"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isDiffObject(obj: any): obj is DiffObject {
  return obj && KEY_ACTION in obj
}
