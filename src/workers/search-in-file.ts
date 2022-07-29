import type { Match, SearchOptions } from "./helpers/search-text"
import { searchText } from "./helpers/search-text"

export interface Options {
  id: string
  text: string
  options: SearchOptions
}
export interface Result {
  id: string
  matches: Match[]
}

addEventListener(
  "message",
  ({ data: { id, text, options } }: MessageEvent<Options>) => {
    postMessage({
      id,
      matches: Array.from(searchText(text, options))
    } as Result)
  }
)
