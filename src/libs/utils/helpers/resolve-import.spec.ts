import { describe, expect, test } from "vitest"

import { resolveImport } from "./resolve-import"

describe("resolve-import", async () => {
  const fn = async (value: string) => `https://unpkg.com/${value}`

  test("import normal", async () => {
    expect(await resolveImport('import fs from "fs"', fn)).toEqual(
      'import fs from "https://unpkg.com/fs"'
    )
    expect(await resolveImport("import fs from 'fs'", fn)).toEqual(
      "import fs from 'https://unpkg.com/fs'"
    )
  })
  test("import { }", async () => {
    expect(await resolveImport("import { fs } from 'fs'", fn)).toEqual(
      "import { fs } from 'https://unpkg.com/fs'"
    )
  })
  test("import * as", async () => {
    expect(await resolveImport("import * as fs from 'fs'", fn)).toEqual(
      "import * as fs from 'https://unpkg.com/fs'"
    )
  })
  test("import newline", async () => {
    expect(
      await resolveImport(
        `import fs
from 'fs'`,
        fn
      )
    ).toEqual(
      `import fs
from 'https://unpkg.com/fs'`
    )
  })
  test("import newline 2", async () => {
    expect(
      await resolveImport(
        `import fs
from 'fs'`,
        fn
      )
    ).toEqual(
      `import fs
from 'https://unpkg.com/fs'`
    )
  })
  test("import newline 3", async () => {
    expect(
      await resolveImport(
        `import fs
from 'fs'`,
        fn
      )
    ).toEqual(
      `import fs
from 'https://unpkg.com/fs'`
    )
  })

  test("dynamic import", async () => {
    expect(await resolveImport("import('./foo')", fn)).toEqual(
      "import('https://unpkg.com/./foo')"
    )
  })
  test("dynamic import newline", async () => {
    expect(
      await resolveImport(
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
