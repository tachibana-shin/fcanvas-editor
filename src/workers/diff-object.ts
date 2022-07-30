import { diff } from "@tachibana-shin/diff-object"

import type { Directory } from "src/libs/InMemoryFS"

addEventListener(
  "message",
  ({
    data
  }: MessageEvent<{
    id: string

    oldMemory: string
    newMemory: Directory
  }>) => {
    const diffs = diff(JSON.parse(data.oldMemory), data.newMemory, {
      symbol: false
    })

    postMessage({
      id: data.id,
      diff: diffs
    })
  }
)
