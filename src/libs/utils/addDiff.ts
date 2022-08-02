import { KEY_ACTION, KEY_VALUEA, KEY_VALUEB } from "@tachibana-shin/diff-object"

import { isDiffMixed } from "./isDiffMixed"
import { isDiffObject } from "./isDiffObject"
import type { Diff, DiffMixed, DiffObject } from "./types"

export const DIFF_OBJECT_MIXED = "#@~!diffObjMixed"
export const DIFF_DIFF_MIXED = "#@~!diffDiffMixed"

export function addDiff(
  diff: Diff,
  name: string,
  newObject: DiffObject | Diff
): -1 | 0 | 1 {
  // console.log({ diff, name })

  // eslint-disable-next-line functional/no-let
  let diffMixed: Diff | DiffMixed = diff
  if (isDiffMixed(diffMixed[name])) {
    diffMixed = diffMixed[name] as DiffMixed
    name = DIFF_DIFF_MIXED
  }

  // old = delete
  // new = added
  // => oldObject = undefined
  const oldObject = diffMixed[name]
  // not exists state
  if (!oldObject) {
    diffMixed[name] = newObject
    return 1
  }

  if (isDiffObject(newObject)) {
    if (isDiffObject(oldObject)) {
      // case
      switch (oldObject[KEY_ACTION]) {
        case "ADDED":
          if (newObject[KEY_ACTION] === "DELETED") {
            // delete diff
            delete diffMixed[name]
            return -1
          }
          break
        // if newObject[KEY_ACTION] is ADDED: never
        // if newObject[KEY_ACTION] is MODIFIED: skip
        case "MODIFIED":
          if (newObject[KEY_ACTION] === "DELETED") {
            diffMixed[name] = newObject
            return 0
          } else if (newObject[KEY_ACTION] === "MODIFIED") {
            if (oldObject[KEY_VALUEA] === oldObject[KEY_VALUEB]) {
              // delete
              delete diffMixed[name]
              return -1
            }
          }
          break
        // if newObject[KEY_ACTION] is "ADDED": never
        case "DELETED":
          if (newObject[KEY_ACTION] === "ADDED") {
            if (oldObject[KEY_VALUEA] === oldObject[KEY_VALUEB]) {
              // delete
              delete diffMixed[name]
              return -1
            }
          }
          break
        // if newObject[KEY_ACTION] is MODIFIED: never
        // if newObject[KEY_ACTION] is DELETED: skip
      }

      return 0
    }
    // is diff
    diffMixed[name] = {
      [DIFF_OBJECT_MIXED]: diffMixed[name],
      [DIFF_DIFF_MIXED]: newObject
    }

    return 1
  }

  if (isDiffMixed(oldObject)) {
    // eslint-disable-next-line functional/no-throw-statement
    throw new Error("LEAK PATH")
  }

  diffMixed[name] = newObject

  return 1
}
