import escapeRegex from "escape-string-regexp"

export interface SearchOptions {
  search: string
  caseSensitive: boolean
  wholeWord: boolean
  regex: boolean
}
export interface Match {
  index: number
  match: string
}
export type SearchResult = Generator<Match, void, unknown>

export function * searchText(
  text: string,
  options: SearchOptions
): SearchResult {
  // search
  const regular =
    (options.regex ? options.search : escapeRegex(options.search)) +
    (options.wholeWord ? "(?=[^a-zA-Z0-9]|$)" : "")

  const regex = new RegExp(regular, options.caseSensitive ? "g" : "gi")

  for (const match of text.matchAll(regex)) {
    yield {
      index: match.index ?? -1,
      match: match[0]
    }
  }
}
