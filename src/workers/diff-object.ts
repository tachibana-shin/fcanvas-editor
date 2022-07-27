import { diff } from "deep-object-diff"

import type { Directory } from "~/libs/InMemoryFS"

addEventListener(
  "message",
  ({
    data
  }: MessageEvent<{
    id: string

    oldMemory: string
    newMemory: Directory
  }>) => {
    const diffs = diff(data.newMemory, JSON.parse(data.oldMemory))

    postMessage({
      id: data.id,
      diff: diffs
    })
  }
)
