import { describe , expect, test } from "vitest"

import { pathToMatch } from "./path-to-match"

describe("path-to-regexp", () => {
  test("normal", () => {
    // eslint-disable-next-line no-template-curly-in-string
    expect(pathToMatch("/assets/${name}")).toEqual("/assets/*")
  })
})
