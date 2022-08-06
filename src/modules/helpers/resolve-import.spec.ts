import { describe, expect, test } from "vitest"

import { resolveImport } from "./resolve-import"

describe("resolve-import", () => {
  const fn = (value: string) => `https://unpkg.com/${value}`

  test("import normal", () => {
    expect(resolveImport('import fs from "fs"', fn)).toEqual(
      'import fs from "https://unpkg.com/fs"'
    )
    expect(resolveImport("import fs from 'fs'", fn)).toEqual(
      "import fs from 'https://unpkg.com/fs'"
    )
  })
  test("import { }", () => {
    expect(resolveImport("import { fs } from 'fs'", fn)).toEqual(
      "import { fs } from 'https://unpkg.com/fs'"
    )
  })
  test("import * as", () => {
    expect(resolveImport("import * as fs from 'fs'", fn)).toEqual(
      "import * as fs from 'https://unpkg.com/fs'"
    )
  })
  test("import newline", () => {
    expect(
      resolveImport(
        `import fs
from 'fs'`,
        fn
      )
    ).toEqual(
      `import fs
from 'https://unpkg.com/fs'`
    )
  })
  test("import newline 2", () => {
    expect(
      resolveImport(
        `import fs
from 'fs'`,
        fn
      )
    ).toEqual(
      `import fs
from 'https://unpkg.com/fs'`
    )
  })
  test("import newline 3", () => {
    expect(
      resolveImport(
        `import fs
from 'fs'`,
        fn
      )
    ).toEqual(
      `import fs
from 'https://unpkg.com/fs'`
    )
  })

  test("dynamic import", () => {
    expect(resolveImport("import('./foo')", fn)).toEqual("import('https://unpkg.com/./foo')")
  })
  test("dynamic import newline", () => {
    expect(
      resolveImport(
        `
import('./foo')
`,
        fn
      )
    ).toEqual(`
import('https://unpkg.com/./foo')
`)
  })
})
