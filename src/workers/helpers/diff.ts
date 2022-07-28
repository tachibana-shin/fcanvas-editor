import isEqual from "lodash.isequal"

import type { Directory } from "~/libs/InMemoryFS"

interface DiffObject {
  action: "ADDED" | "MODIFIED" | "DELETED"
  valueA: unknown
  valueB: unknown
}
interface Diff {
  [name: string]: DiffObject | Diff
}

export function diff(a: Directory, b: Directory): Diff {
  const diffs: Diff = {}

  const keys = new Set([...Object.keys(a), ...Object.keys(b)])

  for (const name of keys) {
    // name in a = NO, --> name in b = YES
    if (!(name in a)) {
      // eslint-disable-next-line functional/immutable-data
      diffs[name] = {
        action: "ADDED",
        valueA: a[name],
        valueB: b[name]
      }
      continue
    }

    // name in b = YES ---> name in a = NO ---> name in a = NOT_EXISTS
    if (!(name in b)) {
      // eslint-disable-next-line functional/immutable-data
      diffs[name] = {
        action: "DELETED",
        valueA: a[name],
        valueB: b[name]
      }
      continue
    }

    // name in a = YES and name in b = YES
    if (isEqual(a[name], b[name])) continue

    if (typeof a[name] === "object" && typeof b[name] === "object") {
      // eslint-disable-next-line functional/immutable-data
      diffs[name] = diff(a[name] as Directory, b[name] as Directory)
      continue
    }

    // eslint-disable-next-line functional/immutable-data
    diffs[name] = {
      action: "MODIFIED",
      valueA: a[name],
      valueB: b[name]
    }
  }

  return diffs
}
