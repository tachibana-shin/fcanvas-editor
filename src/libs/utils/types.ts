import { FieldValue } from "@firebase/firestore"
import type {
  KEY_ACTION,
  KEY_DIFF_DIFF_MIXED,
  KEY_DIFF_OBJECT_MIXED,
  KEY_OLD_VALUE
} from "./const"

export type File = string

export interface Directory {
  [name: string]: File | Directory
}

export interface DiffObject {
  [KEY_ACTION]: "ADDED" | "MODIFIED" | "DELETED"
  [KEY_OLD_VALUE]?: File
}
export interface DiffMixed {
  // eslint-disable-next-line no-use-before-define
  [KEY_DIFF_OBJECT_MIXED]: Diff | DiffObject
  // eslint-disable-next-line no-use-before-define
  [KEY_DIFF_DIFF_MIXED]: DiffObject | Diff
}
export interface Diff {
  [name: string]: DiffObject | Diff | DiffMixed
}

export interface TreeUpdate {
  [name: string]: TreeUpdate | string | FieldValue
}
