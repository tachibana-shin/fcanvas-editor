import { fs } from "src/modules/fs"
import type { SearchOptions } from "src/workers/helpers/search-text"
import type { Result } from "src/workers/search-in-file"
import SearchInFileWorker from "src/workers/search-in-file.ts?worker"
import { v4 } from "uuid"

import { fastGlob } from "./fast-glob"

export interface SearchResult {
  filepath: string
  matches: Result["matches"]
}
// eslint-disable-next-line functional/no-let
let searchInFileWorker: Worker | null = null

// call one of the time
export async function* search(
  options: SearchOptions & {
    include: string[]
    exclude: string[]
  }
) {
  if (searchInFileWorker) searchInFileWorker.terminate()

  searchInFileWorker = new SearchInFileWorker()

  const files = await fastGlob(options.include, options.exclude)

  console.log("[search]: in files", files)

  for (const filepath of files) {
    // eslint-disable-next-line no-async-promise-executor
    yield await new Promise<SearchResult>(async (resolve) => {
      const id = v4()

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      searchInFileWorker!.postMessage({
        id,
        text: await fs.readFile(filepath),
        options: {
          ...options,
          filepath
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      searchInFileWorker!.onmessage = (event: MessageEvent<Result>) => {
        if (id === event.data.id) {
          console.log("[search]: result ", event.data.matches)
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          searchInFileWorker!.onmessage = null

          resolve({
            filepath,
            matches: event.data.matches
          })
        }
      }
    })
  }
}
