// eslint-disable-next-line n/no-unsupported-features/node-builtins
import { Blob } from "buffer"
import { URL } from "url"

import { KEY_ACTION, KEY_VALUEA, KEY_VALUEB } from "@tachibana-shin/diff-object"
import { v4 } from "uuid"
import { describe, expect, test } from "vitest"

import { InMemoryFS } from "./InMemoryFS"
import { DIFF_DIFF_MIXED, DIFF_OBJECT_MIXED } from "./utils/addDiff"

Object.assign(window, {
  URL,
  Blob
})
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

describe("InMemoryFS", () => {
  const fs = new InMemoryFS()

  test("writeFile", async () => {
    fs.clean()

    await fs.writeFile("/test.txt", "hello world")

    expect(await fs.readFile("/test.txt")).toEqual("hello world")

    await fs.writeFile("/test.txt", "hello world2")

    expect(await fs.readFile("/test.txt")).toEqual("hello world2")

    await fs.mkdir("/examples")

    await expect(fs.writeFile("/examples", "")).rejects.toThrowError("IS_DIR")
  })

  test("readFile", async () => {
    fs.clean()

    await fs.writeFile("/test.txt", "hello world")

    expect(await fs.readFile("/test.txt")).toEqual("hello world")

    fs.clean()

    await expect(fs.readFile("/test.txt")).rejects.toThrowError("NOT_EXISTS")
  })

  test("mkdir", async () => {
    fs.clean()

    await fs.mkdir("/examples")
    await fs.writeFile("/test.txt", "")

    expect((await fs.lstat("/examples")).isDirectory()).toEqual(true)
    expect((await fs.lstat("/test.txt")).isDirectory()).toEqual(false)

    await expect(fs.mkdir("/examples")).rejects.toThrowError(
      "IS_DIR: /examples"
    )

    await expect(fs.mkdir("/test.txt")).rejects.toThrowError(
      "IS_FILE: /test.txt"
    )
  })

  describe("rename", () => {
    test("dir", async () => {
      fs.clean()

      await fs.mkdir("/examples")

      expect(await fs.exists("/examples")).toEqual(true)
      expect((await fs.lstat("/examples")).isDirectory()).toEqual(true)

      await fs.rename("/examples", "/examples-rename")

      expect(await fs.exists("/examples")).toEqual(false)
      expect((await fs.lstat("/examples-rename")).isDirectory()).toEqual(true)
    })

    test("file", async () => {
      fs.clean()

      await fs.writeFile("/test.txt", "hello world")

      expect(await fs.exists("/test.txt")).toEqual(true)
      expect((await fs.lstat("/test.txt")).isFile()).toEqual(true)

      await fs.rename("/test.txt", "/test-rename.txt")

      expect(await fs.exists("/test.txt")).toEqual(false)
      expect((await fs.lstat("/test-rename.txt")).isFile()).toEqual(true)
    })
  })

  describe("unlink", () => {
    test("dir", async () => {
      fs.clean()

      await fs.mkdir("/examples")

      expect((await fs.lstat("/examples")).isDirectory()).toEqual(true)

      await fs.unlink("/examples")

      expect(await fs.exists("/examples")).toEqual(false)
    })

    test("file", async () => {
      fs.clean()

      await fs.writeFile("/test.txt", "hello world")

      expect((await fs.lstat("/test.txt")).isFile()).toEqual(true)

      await fs.unlink("/test.txt")

      expect(await fs.exists("/test.txt")).toEqual(false)
    })
  })

  describe("lstat", () => {
    test("isFile", async () => {
      fs.clean()

      await expect(fs.lstat("/test.txt")).rejects.toThrowError("NOT_EXISTS")

      await fs.writeFile("/test.txt", "hello world")

      expect((await fs.lstat("/test.txt")).isFile()).toEqual(true)
      expect((await fs.lstat("/test.txt")).isDirectory()).toEqual(false)
    })
    test("isDirectory", async () => {
      fs.clean()

      await expect(fs.lstat("examples")).rejects.toThrowError("NOT_EXISTS")

      await fs.mkdir("/examples")

      expect((await fs.lstat("/examples")).isDirectory()).toEqual(true)
      expect((await fs.lstat("/examples")).isFile()).toEqual(false)
    })
  })

  describe("readdir", () => {
    test("in root", async () => {
      fs.clean()

      expect(await fs.readdir("/")).toEqual([])

      await fs.mkdir("/examples")

      expect(await fs.readdir("/")).toEqual(["examples"])
    })
    test("in children", async () => {
      fs.clean()

      await expect(fs.readdir("/examples")).rejects.toThrowError("NOT_EXISTS")

      await fs.mkdir("/examples")
      await fs.writeFile("/examples/test.txt", "hello world")

      expect(await fs.readdir("/examples")).toEqual(["test.txt"])
    })
  })

  describe("exists", () => {
    test("file", async () => {
      fs.clean()

      expect(await fs.exists("/test.txt")).toEqual(false)
      await fs.writeFile("/test.txt", "hello world")
      expect(await fs.exists("/test.txt")).toEqual(true)
    })
    test("directory", async () => {
      fs.clean()

      expect(await fs.exists("/examples")).toEqual(false)
      await fs.mkdir("/examples")
      expect(await fs.exists("/examples")).toEqual(true)
    })
  })

  test("readFiles", async () => {
    fs.clean()

    await fs.writeFile("/test.txt", "")

    expect(await fs.readFiles()).toEqual(["test.txt"])

    await fs.mkdir("/examples")
    await fs.writeFile("/examples/test.txt", "test")

    expect(await fs.readFiles()).toEqual(["test.txt", "examples/test.txt"])
  })
})
describe("changelog", () => {
  const fs = new InMemoryFS()

  function resetChangelog() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    fs.changelog = {}
    fs.changelogLength.value = 0
  }

  test("add file", async () => {
    resetChangelog()

    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)

    await fs.writeFile("/test.txt", "hello world")

    expect(fs.changelog).toEqual({
      "test.txt": {
        [KEY_ACTION]: "ADDED",
        [KEY_VALUEA]: undefined,
        [KEY_VALUEB]: "hello world"
      }
    })
    expect(fs.changelogLength.value).toEqual(1)
  })
  test("add file deep", async () => {
    fs.clean()
    resetChangelog()

    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)

    await fs.writeFile("/test.txt", "hello world")
    await fs.writeFile("/test.txt", "hello world 2")

    expect(fs.changelog).toEqual({
      "test.txt": {
        [KEY_ACTION]: "ADDED",
        [KEY_VALUEA]: undefined,
        [KEY_VALUEB]: "hello world"
      }
    })
    expect(fs.changelogLength.value).toEqual(1)
  })
  test("modified file", async () => {
    fs.clean()
    await fs.writeFile("/test.txt", "hello world")
    resetChangelog()

    await fs.writeFile("/test.txt", "hello world 2")

    expect(fs.changelog).toEqual({
      "test.txt": {
        [KEY_ACTION]: "MODIFIED",
        [KEY_VALUEA]: "hello world",
        [KEY_VALUEB]: "hello world 2"
      }
    })
    expect(fs.changelogLength.value).toEqual(1)
  })
  test("delete file", async () => {
    resetChangelog()

    await fs.unlink("/test.txt")

    expect(fs.changelog).toEqual({
      "test.txt": {
        [KEY_ACTION]: "DELETED",
        [KEY_VALUEA]: "hello world 2",
        [KEY_VALUEB]: undefined
      }
    })
    expect(fs.changelogLength.value).toEqual(1)
  })
  test("rename file", async () => {
    fs.clean()

    await fs.writeFile("/test.txt", "hello world")
    resetChangelog()
    await fs.rename("/test.txt", "/test2.txt")

    expect(fs.changelog).toEqual({
      "test.txt": {
        [KEY_ACTION]: "DELETED",
        [KEY_VALUEA]: "hello world",
        [KEY_VALUEB]: undefined
      },
      "test2.txt": {
        [KEY_ACTION]: "ADDED",
        [KEY_VALUEA]: undefined,
        [KEY_VALUEB]: "hello world"
      }
    })
    expect(fs.changelogLength.value).toEqual(2)
  })

  test("create dir", async () => {
    resetChangelog()

    await fs.mkdir("/examples")

    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)
  })
  test("rename dir", async () => {
    await fs.mkdir("/folder-test")
    await fs.writeFile("/folder-test/test.txt", "hello world")

    resetChangelog()

    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)

    await fs.rename("/folder-test", "/folder-test2")

    expect(fs.changelog).toEqual({
      "folder-test": {
        "test.txt": {
          [KEY_ACTION]: "DELETED",
          [KEY_VALUEA]: "hello world",
          [KEY_VALUEB]: undefined
        }
      },
      "folder-test2": {
        "test.txt": {
          [KEY_ACTION]: "ADDED",
          [KEY_VALUEA]: undefined,
          [KEY_VALUEB]: "hello world"
        }
      }
    })
    expect(fs.changelogLength.value).toEqual(2)
  })
  test("delete dir", async () => {
    await fs.mkdir("/folder-test")
    await fs.writeFile("/folder-test/test.txt", "hello world")

    resetChangelog()

    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)

    await fs.unlink("/folder-test")

    expect(fs.changelog).toEqual({
      "folder-test": {
        "test.txt": {
          [KEY_ACTION]: "DELETED",
          [KEY_VALUEA]: "hello world",
          [KEY_VALUEB]: undefined
        }
      }
    })
    expect(fs.changelogLength.value).toEqual(1)
  })

  test("mixed: delete file & create dir", async () => {
    await fs.writeFile("/test.txt", "hello world")

    resetChangelog()

    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)

    await fs.unlink("/test.txt")

    await fs.mkdir("/test.txt")
    await fs.writeFile("/test.txt/test.bat", "echo hello world")

    expect(fs.changelog).toEqual({
      "test.txt": {
        [DIFF_OBJECT_MIXED]: {
          [KEY_ACTION]: "DELETED",
          [KEY_VALUEA]: "hello world",
          [KEY_VALUEB]: undefined
        },
        [DIFF_DIFF_MIXED]: {
          "test.bat": {
            [KEY_ACTION]: "ADDED",
            [KEY_VALUEB]: "echo hello world",
            [KEY_VALUEA]: undefined
          }
        }
      }
    })
    expect(fs.changelogLength.value).toEqual(2)
  })
  test("mixed: delete dir & create file", async () => {
    fs.clean()

    await fs.mkdir("/test")
    await fs.writeFile("/test/index", "test")
    await fs.writeFile("/test2", "")
    resetChangelog()

    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)

    await fs.unlink("/test")
    await fs.rename("/test2", "/test")

    expect(fs.changelog).toEqual({
      test: {
        [DIFF_OBJECT_MIXED]: {
          index: {
            [KEY_ACTION]: "DELETED",
            [KEY_VALUEA]: "test",
            [KEY_VALUEB]: undefined
          }
        },
        [DIFF_DIFF_MIXED]: {
          [KEY_ACTION]: "ADDED",
          [KEY_VALUEA]: undefined,
          [KEY_VALUEB]: ""
        }
      },
      test2: {
        [KEY_ACTION]: "DELETED",
        [KEY_VALUEA]: "",
        [KEY_VALUEB]: undefined
      }
    })
  })
})
describe("object url", () => {
  const fs = new InMemoryFS()

  function isBlob(url?: string): boolean {
    return url?.startsWith("blob:") ?? false
  }
  function validBlob(url?: string): boolean {
    return url !== undefined && blobMap.has(url)
  }

  test("clean", async () => {
    await fs.writeFile("/test.txt", "hello world")

    expect(isBlob(fs.objectURLMap.get("/test.txt"))).toBe(true)
    fs.clean()

    expect(fs.objectURLMap.size).toBe(0)
  })
  test("add file", async () => {
    fs.clean()

    await fs.writeFile("/test.txt", "hello world")

    const url = fs.objectURLMap.get("/test.txt")

    expect(isBlob(url)).toBe(true)
    expect(validBlob(url)).toBe(true)
    expect(fs.objectURLMap.size).toBe(1)
  })
  test("modified file", async () => {
    fs.clean()

    await fs.writeFile("/test.txt", "hello world")

    const url = fs.objectURLMap.get("/test.txt")

    expect(isBlob(url)).toBe(true)
    expect(validBlob(url)).toBe(true)
    expect(fs.objectURLMap.size).toBe(1)

    await fs.writeFile("/test.txt", "hello world 2")

    const url2 = fs.objectURLMap.get("/test.txt")

    expect(isBlob(url2)).toBe(true)
    expect(validBlob(url2)).toBe(true)
    expect(url2).not.toBe(url)
    expect(isBlob(url)).toBe(true)
    expect(validBlob(url)).toEqual(false)
    expect(fs.objectURLMap.size).toBe(1)
  })
  test("delete file", async () => {
    fs.clean()

    await fs.writeFile("/test.txt", "hello world")

    const url = fs.objectURLMap.get("/test.txt")

    expect(isBlob(url)).toBe(true)
    expect(validBlob(url)).toBe(true)
    expect(fs.objectURLMap.size).toBe(1)

    await fs.unlink("/test.txt")

    const url2 = fs.objectURLMap.get("/test.txt")

    expect(isBlob(url2)).toBe(false)
    expect(validBlob(url2)).toBe(false)
    expect(url2).not.toBe(url)
    expect(isBlob(url)).toBe(true)
    expect(validBlob(url)).toEqual(false)
    expect(fs.objectURLMap.size).toBe(0)
  })
  test("rename file", async () => {
    fs.clean()

    await fs.writeFile("/test.txt", "hello world")

    const url = fs.objectURLMap.get("/test.txt")

    expect(isBlob(url)).toBe(true)
    expect(validBlob(url)).toBe(true)
    expect(fs.objectURLMap.size).toBe(1)

    await fs.rename("/test.txt", "/test2.txt")

    const url2 = fs.objectURLMap.get("/test2.txt")

    expect(isBlob(url2)).toBe(true)
    expect(validBlob(url2)).toBe(true)
    expect(url2).toBe(url)
    expect(fs.objectURLMap.size).toBe(1)
  })
  test("rename dir", async () => {
    fs.clean()
    fs.resetChangelog()

    await fs.mkdir("/test")
    await fs.writeFile("/test/index", "test")

    const url = fs.objectURLMap.get("/test/index")

    expect(isBlob(url)).toBe(true)
    expect(validBlob(url)).toBe(true)
    expect(fs.objectURLMap.size).toBe(1)

    await fs.rename("/test", "/test2")

    const url2 = fs.objectURLMap.get("/test2/index")

    expect(isBlob(url2)).toBe(true)
    expect(validBlob(url2)).toBe(true)
    expect(url2).toBe(url)
    expect(fs.objectURLMap.size).toBe(1)
  })
  test("delete dir", async () => {
    fs.clean()
    fs.resetChangelog()

    await fs.mkdir("/test")
    await fs.writeFile("/test/index", "test")

    const url = fs.objectURLMap.get("/test/index")

    expect(isBlob(url)).toBe(true)
    expect(validBlob(url)).toBe(true)
    expect(fs.objectURLMap.size).toBe(1)

    await fs.unlink("/test")

    const url2 = fs.objectURLMap.get("/test/index")

    expect(isBlob(url2)).toBe(false)
    expect(validBlob(url2)).toBe(false)
    expect(url2).not.toBe(url)
    expect(isBlob(url)).toBe(true)
    expect(validBlob(url)).toEqual(false)
    expect(fs.objectURLMap.size).toBe(0)
  })
})
