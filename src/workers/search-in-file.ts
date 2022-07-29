import type { Match, SearchOptions } from "./helpers/search-text"
import { searchText } from "./helpers/search-text"

export interface Options {
  id: string
  text: string
  options: SearchOptions
}
export interface Result {
  id: string
  status: "done" | "running"
  match: Match
}

addEventListener(
  "message",
  ({ data: { id, text, options } }: MessageEvent<Options>) => {
    for (const match of searchText(text, options)) {
      postMessage({
        id,
        status: "running",
        match
      } as Result)
    }

    postMessage({
      id,
      status: "done"
    } as Result)
  }
)
