import { v4 } from "uuid"
import { describe, expect, test } from "vitest"

import { compiler, watchMap } from "./compiler"
import { fs } from "./fs"

const blobMap = new Map<string, Blob>()
Object.assign(URL, {
  createObjectURL(blob: Blob) {
    const url = `blob:${v4()}`
    blobMap.set(url, blob)

    return url
  },
  revokeObjectURL(url: string) {
    const blob = blobMap.get(url)
    if (blob) {
      blobMap.delete(url)
    }
  }
})

const waitTask = (ms?: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

describe("compiler", () => {
  test("should compile", async () => {
    fs.clean()

    await fs.writeFile("/main.js", "console.log('hello')")

    const map = await compiler("/main.js")

    expect(map.has("/main.js")).toBe(true)
    expect(map.size).toEqual(1)
  })
  test("should compile with import", async () => {
    fs.clean()

    await fs.writeFile("/main.js", "import './sub.js'")
    await fs.writeFile("/sub.js", "console.log('hello')")

    const map = await compiler("/main.js")

    expect(map.has("/main.js")).toBe(true)
    expect(map.has("/sub.js")).toBe(true)

    expect(map.size).toEqual(2)
  })
  test("should count dependencies one file", async () => {
    fs.clean()

    await fs.writeFile("/main.js", "import './sub.js'\nimport './sub2.js'")
    await fs.writeFile("/sub.js", "console.log('hello')")
    await fs.writeFile("/sub2.js", "import './sub.js'; console.log('hello')")

    const map = await compiler("/main.js")
    
    expect(map.has("/main.js")).toBe(true)
    expect(map.has("/sub.js")).toBe(true)
    expect(map.get("/sub.js")?.count).toBe(2)
    expect(map.has("/sub2.js")).toBe(true)

    expect(map.size).toEqual(3)
  })
  test("should compile with import dynamic (static path)", async () => {
    fs.clean()

    await fs.writeFile("/main.js", "import('./sub.js')")
    await fs.writeFile("/sub.js", "console.log('hello')")

    const map = await compiler("/main.js")

    expect(map.has("/main.js")).toBe(true)
    expect(map.has("/sub.js")).toBe(true)
    expect(map.size).toEqual(2)
  })
  test("should compile with dynamic import", async () => {
    fs.clean()

    await fs.writeFile("/main.js", "import('./sub.js')")
    await fs.mkdir("/assets")
    await fs.writeFile("/assets/sub.js", "console.log('hello')")
    await fs.writeFile("/sub.js", "console.log('hello')")

    // eslint-disable-next-line no-template-curly-in-string
    await fs.writeFile("/main.js", "import(`/assets/${name}`)")

    const map = await compiler("/main.js")

    expect(map.has("/main.js")).toBe(true)
    expect(map.has("/assets/sub.js")).toBe(true)
    expect(map.has("/sub.js")).toBe(false)
    expect(map.size).toEqual(2)
  })
})

describe("watchMap", () => {
  test("should watchMap", async () => {
    fs.clean()

    await fs.writeFile("/main.js", "console.log('hello')")

    const map = await compiler("/main.js")
    watchMap(map)

    expect(map.has("/main.js")).toBe(true)
    expect(map.size).toEqual(1)

    await fs.writeFile("/sub.js", "console.log('hello')")
    await waitTask()

    expect(map.has("/main.js")).toBe(true)
    expect(map.size).toEqual(1)

    await fs.writeFile("/main.js", "import './sub.js'")
    await waitTask()

    expect(map.has("/main.js")).toBe(true)
    expect(map.has("/sub.js")).toBe(true)
    expect(map.size).toEqual(2)
  })
  test("should no rebuild file", async () => {
    fs.clean()

    await fs.writeFile("/main.js", "import './sub.js'\nimport './sub2.js'")
    await fs.writeFile("/sub.js", "console.log('hello')")
    await fs.writeFile("/sub2.js", "console.log('hello')")

    const map = await compiler("/main.js")

    expect(map.has("/main.js")).toBe(true)
    expect(map.has("/sub.js")).toBe(true)
    expect(map.get("/sub.js")?.count).toBe(1)
    expect(map.has("/sub2.js")).toBe(true)

    expect(map.size).toEqual(3)

    const blobSub = map.get("/sub.js")?.blob
    watchMap(map)

    await fs.writeFile("/sub2.js", "import './sub.js'; console.log('hello')")
    await waitTask()

    expect(blobSub).toEqual(map.get("/sub.js")?.blob)
    expect(map.get("/sub.js")?.count).toBe(2)
  })
  test("should watchMap with import", async () => {
    fs.clean()

    await fs.writeFile("/main.js", "import './sub.js'")
    await fs.writeFile("/sub.js", "console.log('hello')")

    const map = await compiler("/main.js")
    watchMap(map)

    expect(map.has("/main.js")).toBe(true)
    expect(map.has("/sub.js")).toBe(true)
    expect(map.size).toEqual(2)

    await fs.writeFile("/main.js", "console.log('hello')")
    await waitTask()

    expect(map.has("/main.js")).toBe(true)
    expect(map.has("/sub.js")).toBe(false)
    expect(map.size).toEqual(1)
  })
  test("should watchMap with import dynamic (static path)", async () => {
    fs.clean()

    await fs.writeFile("/main.js", "import('./sub.js')")
    await fs.writeFile("/sub.js", "console.log('hello')")

    const map = await compiler("/main.js")
    watchMap(map)

    expect(map.has("/main.js")).toBe(true)
    expect(map.has("/sub.js")).toBe(true)
    expect(map.size).toEqual(2)

    await fs.writeFile("/main.js", "console.log('hello')")
    await waitTask()

    expect(map.has("/main.js")).toBe(true)
    expect(map.has("/sub.js")).toBe(false)
    expect(map.size).toEqual(1)
  })
  test("should watchMap with dynamic import", async () => {
    await fs.writeFile("/main.js", "import('./sub.js')")
    await fs.mkdir("/assets")
    await fs.writeFile("/assets/sub.js", "console.log('hello')")
    await fs.writeFile("/sub.js", "console.log('hello')")

    // eslint-disable-next-line no-template-curly-in-string
    await fs.writeFile("/main.js", "import(`/assets/${name}`)")

    const map = await compiler("/main.js")

    watchMap(map)
    expect(map.has("/main.js")).toBe(true)
    expect(map.has("/assets/sub.js")).toBe(true)
    expect(map.has("/sub.js")).toBe(false)
    expect(map.size).toEqual(2)

    await fs.writeFile("/main.js", "console.log('hello')")
    await waitTask()

    expect(map.has("/main.js")).toBe(true)
    expect(map.size).toEqual(1)
  })
  test("should rebuild", async () => {
    fs.clean()
    await fs.writeFile("/main.js", "import './sub.js'")
    await fs.writeFile("/sub.js", "console.log('hello')")

    const map = await compiler("/main.js")

    watchMap(map)

    expect(map.has("/main.js")).toBe(true)
    expect(map.has("/sub.js")).toBe(true)
    expect(map.size).toEqual(2)

    const blob = map.get("/main.js")?.blob

    await fs.writeFile("/main.js", "console.log('hello')")
    await waitTask()

    expect(map.has("/main.js")).toBe(true)
    expect(map.get("/main.js")?.blob).not.toEqual(blob)
    expect(map.size).toEqual(1)
  })
})
