import type {
  KEY_ACTION,
  KEY_VALUEA,
  KEY_VALUEB
} from "@tachibana-shin/diff-object"

import type { DIFF_DIFF_MIXED, DIFF_OBJECT_MIXED } from "./addDiff"

export type File = string

export interface Directory {
  [name: string]: File | Directory
}

export interface DiffObject {
  [KEY_ACTION]: "ADDED" | "MODIFIED" | "DELETED"
  [KEY_VALUEA]: undefined | File
  [KEY_VALUEB]: undefined | File
}
export interface DiffMixed {
  [DIFF_OBJECT_MIXED]: DiffObject
  // eslint-disable-next-line no-use-before-define
  [DIFF_DIFF_MIXED]: Diff
}
export interface Diff {
  [name: string]: DiffObject | Diff | DiffMixed
}
