import { CHAR_KEEP } from "./CHAR_KEEP"
import {
  KEY_ACTION,
  KEY_DIFF_DIFF_MIXED,
  KEY_DIFF_OBJECT_MIXED,
  KEY_OLD_VALUE
} from "./const"
import { isDiffMixed } from "./isDiffMixed"
import { isDiffObject } from "./isDiffObject"
import { isDirectory } from "./isDirectory"
import { markDiff } from "./markDiff"
import type { Diff, DiffObject, Directory } from "./types"

function getCountChange(diff: Diff | DiffObject): number {
  if (isDiffObject(diff)) return 1

  let sum = 0
  for (const name in diff) {
    const obj = diff[name]
    if (isDiffMixed(obj)) continue
    sum += getCountChange(obj)
  }

  return sum
}

export function addDiff(
  diff: Diff,
  name: string,
  action: "ADDED" | "MODIFIED" | "DELETED",
  newDir: Directory
): number
export function addDiff(
  diff: Diff,
  name: string,
  action: "ADDED" | "MODIFIED" | "DELETED",
  oldContent?: string,
  newContent?: string
): number
export function addDiff(
  diff: Diff,
  name: string,
  action: "ADDED" | "MODIFIED" | "DELETED",
  oldContent?: string | Directory,
  newContent?: string
): number {
  // console.log({ diff, name, action, oldContent, newContent })

  const obj = diff[name] as typeof diff[typeof name] | undefined
  const isDir = oldContent && isDirectory(oldContent)

  switch (action) {
    case "DELETED":
      if (!obj) {
        // aaaaaa
        if (isDir) {
          // delete all files
          const { diffs, count } = markDiff(oldContent, true)
          diff[name] = diffs
          return count
        }

        diff[name] = {
          [KEY_ACTION]: "DELETED",
          [KEY_OLD_VALUE]: oldContent
        }
        return 1
      }
      if (isDiffObject(obj)) {
        // eslint-disable-next-line functional/no-throw-statement
        if (isDir) throw new Error("THIS_CASE_NOT_NEVER_EXIST")
        if (obj[KEY_ACTION] === "ADDED" && obj[KEY_OLD_VALUE] === newContent) {
          delete diff[name]
          return -1
        }
        return 0
      }
      if (isDiffMixed(obj)) {
        diff[name] = obj[KEY_DIFF_OBJECT_MIXED]
        return -getCountChange(
          obj[KEY_DIFF_DIFF_MIXED]
        )
      }

      if (isDir) {
        let count = 0
        for (const name in oldContent) {
          if (name === CHAR_KEEP) continue
          const obj2 = oldContent[name]
          if (isDirectory(obj2)) count += addDiff(obj, name, "DELETED", obj2)
          else count += addDiff(obj, name, "DELETED")
        }
        if (isEmpty(obj)) delete diff[name]
        return count
      }
      // eslint-disable-next-line functional/no-throw-statement
      throw new Error("THIS_CASE_NOT_NEVER_EXIST")
    case "MODIFIED":
      // eslint-disable-next-line functional/no-throw-statement
      if (isDir) throw new Error("THIS_CASE_NOT_NEVER_EXIST")

      if (!obj) {
        diff[name] = {
          [KEY_ACTION]: "MODIFIED",
          [KEY_OLD_VALUE]: oldContent
        }
        return 1
      }
      if (isDiffObject(obj)) {
        if (obj[KEY_OLD_VALUE] === newContent) {
          delete diff[name]
          return -1
        }
        return 0
      }
      if (isDiffMixed(obj)) {
        return 0
        // eslint-disable-next-line functional/no-throw-statement
        throw new Error("THIS_CASE_NOT_NEVER_EXIST")
      }
      // eslint-disable-next-line functional/no-throw-statement
      throw new Error("THIS_CASE_NOT_NEVER_EXIST")
    case "ADDED":
      if (!obj) {
        // aaaaaa
        if (isDir) {
          // delete all files
          const { diffs, count } = markDiff(oldContent, false)
          diff[name] = diffs
          return count
        }

        diff[name] = {
          [KEY_ACTION]: "ADDED"
        }
        return 1
      }
      if (isDiffObject(obj)) {
        if (isDir) {
          if (obj[KEY_ACTION] === "DELETED") {
            const { diffs, count } = markDiff(oldContent)
            diff[name] = {
              [KEY_DIFF_OBJECT_MIXED]: obj,
              [KEY_DIFF_DIFF_MIXED]: diffs
            }
            return count
          }

          // eslint-disable-next-line functional/no-throw-statement
          throw new Error("THIS_CASE_NOT_NEVER_EXIST")
        }

        if (obj[KEY_ACTION] === "DELETED") {
          if (obj[KEY_OLD_VALUE] === newContent) {
            delete diff[name]
            return -1
          }
        }
        return 0
      }
      if (isDiffMixed(obj)) {
        // eslint-disable-next-line functional/no-throw-statement
        throw new Error("THIS_CASE_NOT_NEVER_EXIST")
      }
      if (isDir) {
        // return
        let count = 0
        for (const name in oldContent) {
          if (name === CHAR_KEEP) continue
          const obj2 = oldContent[name]
          if (isDirectory(obj2)) count += addDiff(obj, name, "ADDED", obj2)
          else count += addDiff(obj, name, "ADDED", undefined, obj2)
        }
        if (isEmpty(obj)) delete diff[name]
        return count
      }
      diff[name] = {
        [KEY_DIFF_OBJECT_MIXED]: obj,
        [KEY_DIFF_DIFF_MIXED]: {
          [KEY_ACTION]: "ADDED"
        }
      }
      return 1
      // eslint-disable-next-line functional/no-throw-statement
      throw new Error("THIS_CASE_NOT_NEVER_EXIST")
  }

  // // eslint-disable-next-line functional/no-let, @typescript-eslint/no-explicit-any
  // let diffMixed: any = diff
  // const isChild = isDiffMixed(diffMixed[name])
  // if (isChild) {
  //   diffMixed = diffMixed[name] as DiffMixed
  //   name = KEY_DIFF_DIFF_MIXED
  // }

  // // old = delete
  // // new = added
  // // => oldObject = undefined
  // const oldObject = diffMixed[name]
  // console.log({ oldObject })

  // if (typeof oldContent !== "object" || isDiffObject(diffMixed) || isChild) {
  //   // not exists state
  //   if (!oldObject) {
  //     diffMixed[name] = {
  //       [KEY_ACTION]: action,
  //       [KEY_OLD_VALUE]: oldContent
  //     }
  //     return 1
  //   }

  //   if (isDiffMixed(oldObject)) {
  //     // eslint-disable-next-line functional/no-throw-statement
  //     throw new Error("LEAK PATH")
  //   }

  //   if (isDiffObject(oldObject)) {
  //     // case
  //     switch (oldObject[KEY_ACTION]) {
  //       case "ADDED":
  //         if (action === "DELETED") {
  //           // delete diff
  //           delete diffMixed[name]
  //           // flat diff
  //           if (isChild) diff[name] = diffMixed[KEY_DIFF_OBJECT_MIXED]
  //           return -1
  //         }
  //         break
  //       // if action is ADDED: never
  //       // if action is MODIFIED: skip
  //       case "MODIFIED":
  //         if (action === "DELETED") {
  //           diffMixed[name] = {
  //             [KEY_ACTION]: action,
  //             [KEY_OLD_VALUE]: oldContent
  //           }
  //           return 0
  //         } else if (action === "MODIFIED") {
  //           if (oldObject[KEY_OLD_VALUE] === newContent) {
  //             // delete
  //             delete diffMixed[name]
  //             // flat diff
  //             if (isChild) diff[name] = diffMixed[KEY_DIFF_OBJECT_MIXED]
  //             return -1
  //           }
  //         }
  //         break
  //       // if action is "ADDED": never
  //       case "DELETED":
  //         if (action === "ADDED") {
  //           if (oldObject[KEY_OLD_VALUE] === newContent) {
  //             // delete
  //             delete diffMixed[name]
  //             // flat diff
  //             if (isChild) diff[name] = diffMixed[KEY_DIFF_OBJECT_MIXED]
  //             return -1
  //           }
  //         }
  //         break
  //       // if action is MODIFIED: never
  //       // if action is DELETED: skip
  //     }

  //     return 0
  //   }
  //   // is diff
  //   diffMixed[name] = {
  //     [KEY_DIFF_OBJECT_MIXED]: oldObject,
  //     [KEY_DIFF_DIFF_MIXED]: {
  //       [KEY_ACTION]: action,
  //       [KEY_OLD_VALUE]: oldContent
  //     }
  //   }

  //   return 1
  // } else {
  //   const newDir = oldContent
  //   // not exists state
  //   if (!oldObject) {
  //     const { diffs, count } = markDiff(newDir, action === "DELETED")

  //     diffMixed[name] = diffs

  //     return count
  //   }

  //   if (isDiffMixed(oldObject)) {
  //     // eslint-disable-next-line functional/no-throw-statement
  //     throw new Error("LEAK PATH")
  //   }

  //   if (isDiffObject(oldObject)) {
  //     if (action === "ADDED") {
  //       const { diffs, count } = markDiff(newDir)
  //       diffMixed[name] = {
  //         [KEY_DIFF_OBJECT_MIXED]: oldObject,
  //         [KEY_DIFF_DIFF_MIXED]: diffs
  //       }
  //       return count
  //     } else {
  //       // skip
  //     }

  //     return 0
  //   }

  //   // eslint-disable-next-line functional/no-let
  //   let count = 0
  //   for (const name in newDir) {
  //     if (name === CHAR_KEEP) continue

  //     const item = newDir[name]
  //     if (typeof item === "string") {
  //       count += addDiff(oldObject, name, action, undefined, item)
  //     } else {
  //       count += addDiff(oldObject, name, action, item)
  //     }
  //   }

  //   if (isEmpty(oldObject)) {
  //     delete diffMixed[name]
  //   }

  //   return count
  // }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isEmpty(obj: any): boolean {
  // eslint-disable-next-line no-unreachable-loop
  for (const _a in obj) return false

  return true
}
