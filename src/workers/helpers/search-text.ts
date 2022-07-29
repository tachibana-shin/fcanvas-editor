import escapeRegex from "escape-string-regexp"

export interface SearchOptions {
  search: string
  caseSensitive: boolean
  wholeWord: boolean
  regexp: boolean
}
export interface Match {
  index: number
  match: string
  before: string
  after: string
}
export type SearchResult = Generator<Match, void, unknown>

const rNotWord = /[^a-z0-9]/i
const maxLengthPesduso = 30

function getStringBeforeMatch(
  text: string,
  lengthMatch: number,
  index: number
): string {
  // eslint-disable-next-line functional/no-let
  let words = ""
  // eslint-disable-next-line functional/no-let
  for (let i = 1; i <= maxLengthPesduso; i++) {
    const char = text[index - i]

    if (!char) break
    if (rNotWord.test(char)) break

    words = char + words
  }

  return words
}
function getStringAfterMatches(
  text: string,
  lengthMatch: number,
  index: number
): string {
  // eslint-disable-next-line functional/no-let
  let words = ""
  // eslint-disable-next-line functional/no-let
  for (let i = 0; i <= maxLengthPesduso; i++) {
    const char = text[index + lengthMatch + i]

    if (!char) break
    if (i > 10 && rNotWord.test(char)) break

    words += char
  }

  return words
}

export function * searchText(
  text: string,
  options: SearchOptions
): SearchResult {
  // search
  const regular =
    (options.regexp ? options.search : escapeRegex(options.search)) +
    (options.wholeWord ? "(?=[^a-zA-Z0-9]|$)" : "")

  const regex = new RegExp(regular, options.caseSensitive ? "g" : "gi")

  for (const match of text.matchAll(regex)) {
    const { length: lengthMatch } = match[0]

    yield {
      index: match.index ?? -1,
      match: match[0],
      before: getStringBeforeMatch(text, lengthMatch, match.index ?? -1),
      after: getStringAfterMatches(text, lengthMatch, match.index ?? -1)
    }
  }
}
