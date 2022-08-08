import { describe, expect, test } from "vitest"

import { srcScriptToImport } from "./src-script-to-import"

describe("srcScriptToImport", () => {
  test("script src", () => {
    expect(
      srcScriptToImport('<script type="module" src="/main.js"></script>')
    ).toEqual({
      code: '<script type="module" >import "~/main.js"</script>',
      depends: ["/main.js"]
    })
  })
  test("script no src", () => {
    expect(srcScriptToImport('<script type="module"></script>')).toEqual({
      code: '<script type="module"></script>',
      depends: []
    })
  })
  test("script src newline", () => {
    expect(
      srcScriptToImport(`<script
      type="module"
      src="/main.js"></script>`)
    ).toEqual({
      code: `<script
      type="module"
      >import "~/main.js"</script>`,
      depends: ["/main.js"]
    })
  })
})
