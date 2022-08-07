import { describe, expect, test } from "vitest"

import { srcScriptToImport } from "./src-script-to-import"

describe("srcScriptToImport", () => {
  test("script src", () => {
    expect(
      srcScriptToImport('<script type="module" src="/main.js"></script>')
    ).toEqual('<script type="module" >import "~/main.js"</script>')
  })
  test("script no src", () => {
    expect(srcScriptToImport('<script type="module"></script>')).toEqual(
      '<script type="module"></script>'
    )
  })
  test("script src newline", () => {
    expect(
      srcScriptToImport(`<script
      type="module"
      src="/main.js"></script>`)
    ).toEqual(`<script
      type="module"
      >import "~/main.js"</script>`)
  })
})
