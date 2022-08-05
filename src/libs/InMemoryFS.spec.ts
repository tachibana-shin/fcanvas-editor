// eslint-disable-next-line n/no-unsupported-features/node-builtins
import { deleteField } from "@firebase/firestore"
import { Blob } from "buffer"
import { URL } from "url"

import { v4 } from "uuid"
import { describe, expect, test } from "vitest"

import { InMemoryFS } from "./InMemoryFS"
import {
  KEY_ACTION,
  KEY_DIFF_DIFF_MIXED,
  KEY_DIFF_OBJECT_MIXED,
  KEY_OLD_VALUE
} from "./utils/const"

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

  test("mkdir recursive", async () => {
    fs.clean()

    await fs.mkdir("/examples/foo", {
      recursive: true
    })

    expect((await fs.lstat("/examples/foo")).isDirectory()).toEqual(true)
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
    fs.clean()
    resetChangelog()

    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)

    await fs.writeFile("/test.txt", "hello world")

    expect(fs.changelog).toEqual({
      "test.txt": {
        [KEY_ACTION]: "ADDED",
        [KEY_OLD_VALUE]: undefined
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
        [KEY_OLD_VALUE]: undefined
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
        [KEY_OLD_VALUE]: "hello world"
      }
    })
    expect(fs.changelogLength.value).toEqual(1)
  })
  test("modified file", async () => {
    fs.clean()
    await fs.writeFile("/test.txt", "hello world")
    resetChangelog()

    await fs.writeFile("/test.txt", "hello world 2")
    await fs.writeFile("/test.txt", "hello world 3")

    expect(fs.changelog).toEqual({
      "test.txt": {
        [KEY_ACTION]: "MODIFIED",
        [KEY_OLD_VALUE]: "hello world"
      }
    })
    expect(fs.changelogLength.value).toEqual(1)
  })

  test("delete file", async () => {
    fs.clean()

    await fs.writeFile("/test.txt", "hello")
    resetChangelog()

    await fs.unlink("/test.txt")

    expect(fs.changelog).toEqual({
      "test.txt": {
        [KEY_ACTION]: "DELETED",
        [KEY_OLD_VALUE]: "hello"
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
        [KEY_OLD_VALUE]: "hello world"
      },
      "test2.txt": {
        [KEY_ACTION]: "ADDED",
        [KEY_OLD_VALUE]: undefined
      }
    })
    expect(fs.changelogLength.value).toEqual(2)
  })

  test("create dir", async () => {
    fs.clean()
    resetChangelog()

    await fs.mkdir("/examples")

    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)
  })
  test("rename dir", async () => {
    fs.clean()
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
          [KEY_OLD_VALUE]: "hello world"
        }
      },
      "folder-test2": {
        "test.txt": {
          [KEY_ACTION]: "ADDED"
        }
      }
    })
    expect(fs.changelogLength.value).toEqual(2)
  })
  test("delete dir", async () => {
    fs.clean()
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
          [KEY_OLD_VALUE]: "hello world"
        }
      }
    })
    expect(fs.changelogLength.value).toEqual(1)
  })

  test("mixed: delete file & create dir", async () => {
    fs.clean()
    await fs.writeFile("/test.txt", "hello world")

    resetChangelog()

    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)

    await fs.unlink("/test.txt")

    await fs.mkdir("/test.txt")
    await fs.writeFile("/test.txt/test.bat", "echo hello world")

    expect(fs.changelog).toEqual({
      "test.txt": {
        [KEY_DIFF_OBJECT_MIXED]: {
          [KEY_ACTION]: "DELETED",
          [KEY_OLD_VALUE]: "hello world"
        },
        [KEY_DIFF_DIFF_MIXED]: {
          "test.bat": {
            [KEY_ACTION]: "ADDED",
            [KEY_OLD_VALUE]: undefined
          }
        }
      }
    })
    expect(fs.changelogLength.value).toEqual(2)
  })
  test("mixed: delete file & create dir deep", async () => {
    fs.clean()
    resetChangelog()
    await fs.writeFile("/test.txt", "hello world")

    resetChangelog()

    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)

    await fs.unlink("/test.txt")

    await fs.mkdir("/test.txt")
    await fs.writeFile("/test.txt/test.bat", "echo hello world")
    await fs.writeFile("/test.txt/test.bat2", "echo hello world")

    expect(fs.changelog).toEqual({
      "test.txt": {
        [KEY_DIFF_OBJECT_MIXED]: {
          [KEY_ACTION]: "DELETED",
          [KEY_OLD_VALUE]: "hello world"
        },
        [KEY_DIFF_DIFF_MIXED]: {
          "test.bat": {
            [KEY_ACTION]: "ADDED",
            [KEY_OLD_VALUE]: undefined
          },
          "test.bat2": {
            [KEY_ACTION]: "ADDED",
            [KEY_OLD_VALUE]: undefined
          }
        }
      }
    })
    expect(fs.changelogLength.value).toEqual(3)
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
        [KEY_DIFF_OBJECT_MIXED]: {
          index: {
            [KEY_ACTION]: "DELETED",
            [KEY_OLD_VALUE]: "test"
          }
        },
        [KEY_DIFF_DIFF_MIXED]: {
          [KEY_ACTION]: "ADDED",
          [KEY_OLD_VALUE]: undefined
        }
      },
      test2: {
        [KEY_ACTION]: "DELETED",
        [KEY_OLD_VALUE]: ""
      }
    })
  })
  test("mixed: delete dir & create file deep", async () => {
    fs.clean()

    await fs.mkdir("/test")
    await fs.writeFile("/test/index", "test")
    await fs.writeFile("/test2", "")
    resetChangelog()

    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)

    await fs.unlink("/test")
    await fs.rename("/test2", "/test")
    await fs.writeFile("/test", "hello world")

    expect(fs.changelog).toEqual({
      test: {
        [KEY_DIFF_OBJECT_MIXED]: {
          index: {
            [KEY_ACTION]: "DELETED",
            [KEY_OLD_VALUE]: "test"
          }
        },
        [KEY_DIFF_DIFF_MIXED]: {
          [KEY_ACTION]: "ADDED",
          [KEY_OLD_VALUE]: undefined
        }
      },
      test2: {
        [KEY_ACTION]: "DELETED",
        [KEY_OLD_VALUE]: ""
      }
    })
  })

  describe("restore", () => {
    test("add file", async () => {
      fs.clean()
      resetChangelog()

      expect(fs.changelog).toEqual({})
      expect(fs.changelogLength.value).toEqual(0)

      await fs.writeFile("/test.txt", "hello world")
      await fs.unlink("/test.txt")

      expect(fs.changelog).toEqual({})
      expect(fs.changelogLength.value).toEqual(0)
    })
    test("add file deep", async () => {
      fs.clean()
      resetChangelog()

      expect(fs.changelog).toEqual({})
      expect(fs.changelogLength.value).toEqual(0)

      await fs.writeFile("/test.txt", "hello world")
      await fs.writeFile("/test.txt", "hello world 2")
      await fs.unlink("/test.txt")

      expect(fs.changelog).toEqual({})
      expect(fs.changelogLength.value).toEqual(0)
    })
    test("modified file", async () => {
      fs.clean()
      await fs.writeFile("/test.txt", "hello world")
      resetChangelog()

      await fs.writeFile("/test.txt", "hello world 2")
      await fs.writeFile("/test.txt", "hello world")

      expect(fs.changelog).toEqual({})
      expect(fs.changelogLength.value).toEqual(0)
    })
    test("delete file", async () => {
      fs.clean()

      await fs.writeFile("/test.txt", "hello")
      resetChangelog()

      await fs.unlink("/test.txt")
      await fs.writeFile("/test.txt", "hello")

      expect(fs.changelog).toEqual({})
      expect(fs.changelogLength.value).toEqual(0)
    })
    test("rename file", async () => {
      fs.clean()

      await fs.writeFile("/test.txt", "hello world")
      resetChangelog()
      await fs.rename("/test.txt", "/test2.txt")
      await fs.rename("/test2.txt", "/test.txt")

      expect(fs.changelog).toEqual({})
      expect(fs.changelogLength.value).toEqual(0)
    })
    test("rename dir", async () => {
      fs.clean()
      await fs.mkdir("/folder-test")
      await fs.writeFile("/folder-test/test.txt", "hello world")

      resetChangelog()

      expect(fs.changelog).toEqual({})
      expect(fs.changelogLength.value).toEqual(0)

      await fs.rename("/folder-test", "/folder-test2")
      await fs.rename("/folder-test2", "/folder-test")

      expect(fs.changelog).toEqual({})
      expect(fs.changelogLength.value).toEqual(0)
    })
    test("delete dir", async () => {
      fs.clean()
      await fs.mkdir("/folder-test")
      await fs.writeFile("/folder-test/test.txt", "hello world")

      resetChangelog()

      expect(fs.changelog).toEqual({})
      expect(fs.changelogLength.value).toEqual(0)

      await fs.unlink("/folder-test")
      await fs.mkdir("/folder-test")
      await fs.writeFile("/folder-test/test.txt", "hello world")

      expect(fs.changelog).toEqual({
        "folder-test": {}
      })
      expect(fs.changelogLength.value).toEqual(0)
    })

    test("mixed: rm & mv & restore", async () => {
      fs.clean()

      await fs.mkdir("/test")
      await fs.writeFile("/test/index", "test")
      await fs.writeFile("/test2", "")
      resetChangelog()

      await fs.unlink("/test")
      await fs.rename("/test2", "/test")
      await fs.writeFile("/test", "hello world")
      await fs.writeFile("/test", "")
      expect(fs.changelog).toEqual({
        test: {
          [KEY_DIFF_OBJECT_MIXED]: {
            index: {
              [KEY_ACTION]: "DELETED",
              [KEY_OLD_VALUE]: "test"
            }
          },
          [KEY_DIFF_DIFF_MIXED]: {
            [KEY_ACTION]: "ADDED"
          }
        },
        test2: {
          [KEY_ACTION]: "DELETED",
          [KEY_OLD_VALUE]: ""
        }
      })
      await fs.rename("/test", "/test2")
      expect(fs.changelog).toEqual({
        test: { index: { [KEY_ACTION]: "DELETED", [KEY_OLD_VALUE]: "test" } }
      })
      await fs.mkdir("/test")
      await fs.writeFile("/test/index", "test")
      expect(fs.changelog).toEqual({
        test: {}
      })
      expect(fs.changelogLength.value).toEqual(0)
    })
    test("mixed: delete file & create dir", async () => {
      fs.clean()
      await fs.writeFile("/test.txt", "hello world")

      resetChangelog()

      expect(fs.changelog).toEqual({})
      expect(fs.changelogLength.value).toEqual(0)

      await fs.unlink("/test.txt")

      await fs.mkdir("/test.txt")
      await fs.writeFile("/test.txt/test.bat", "echo hello world")
      await fs.unlink("/test.txt")
      await fs.writeFile("/test.txt", "hello world")

      expect(fs.changelog).toEqual({})
      expect(fs.changelogLength.value).toEqual(0)
    })
    test("mixed: delete file & create dir deep", async () => {
      fs.clean()
      resetChangelog()
      await fs.writeFile("/test.txt", "hello world")

      resetChangelog()

      expect(fs.changelog).toEqual({})
      expect(fs.changelogLength.value).toEqual(0)

      await fs.unlink("/test.txt")

      await fs.mkdir("/test.txt")
      await fs.writeFile("/test.txt/test.bat", "echo hello world")
      await fs.writeFile("/test.txt/test.bat2", "echo hello world")

      expect(fs.changelog).toEqual({
        "test.txt": {
          [KEY_DIFF_OBJECT_MIXED]: {
            [KEY_ACTION]: "DELETED",
            [KEY_OLD_VALUE]: "hello world"
          },
          [KEY_DIFF_DIFF_MIXED]: {
            "test.bat": {
              [KEY_ACTION]: "ADDED",
              [KEY_OLD_VALUE]: undefined
            },
            "test.bat2": {
              [KEY_ACTION]: "ADDED",
              [KEY_OLD_VALUE]: undefined
            }
          }
        }
      })
      expect(fs.changelogLength.value).toEqual(3)

      await fs.unlink("/test.txt")
      await fs.writeFile("/test.txt", "hello world")

      expect(fs.changelog).toEqual({})
      expect(fs.changelogLength.value).toEqual(0)
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
          [KEY_DIFF_OBJECT_MIXED]: {
            index: {
              [KEY_ACTION]: "DELETED",
              [KEY_OLD_VALUE]: "test"
            }
          },
          [KEY_DIFF_DIFF_MIXED]: {
            [KEY_ACTION]: "ADDED",
            [KEY_OLD_VALUE]: undefined
          }
        },
        test2: {
          [KEY_ACTION]: "DELETED",
          [KEY_OLD_VALUE]: ""
        }
      })

      await fs.rename("/test", "/test2")
      await fs.mkdir("/test")
      await fs.writeFile("/test/index", "test")

      expect(fs.changelog).toEqual({ test: {} })
      expect(fs.changelogLength.value).toEqual(0)
    })
    test("mixed: delete dir & create file deep", async () => {
      fs.clean()

      await fs.mkdir("/test")
      await fs.writeFile("/test/index", "test")
      await fs.writeFile("/test2", "")
      resetChangelog()

      expect(fs.changelog).toEqual({})
      expect(fs.changelogLength.value).toEqual(0)

      await fs.unlink("/test")
      await fs.rename("/test2", "/test")
      await fs.writeFile("/test", "hello world")

      expect(fs.changelog).toEqual({
        test: {
          [KEY_DIFF_OBJECT_MIXED]: {
            index: {
              [KEY_ACTION]: "DELETED",
              [KEY_OLD_VALUE]: "test"
            }
          },
          [KEY_DIFF_DIFF_MIXED]: {
            [KEY_ACTION]: "ADDED",
            [KEY_OLD_VALUE]: undefined
          }
        },
        test2: {
          [KEY_ACTION]: "DELETED",
          [KEY_OLD_VALUE]: ""
        }
      })

      await fs.writeFile("/test", "")
      await fs.rename("/test", "/test2")
      await fs.mkdir("/test")
      await fs.writeFile("/test/index", "test")
      expect(fs.changelog).toEqual({ test: {} })
      expect(fs.changelogLength.value).toEqual(0)
    })
  })
})
describe("restore", () => {
  const fs = new InMemoryFS()

  function resetChangelog() {
    fs.resetChangelog()
    fs.changelogLength.value = 0
  }

  test("add file", async () => {
    fs.clean()
    resetChangelog()

    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)

    await fs.writeFile("/test.txt", "hello world")
    // fs.changelog
    await fs.restore("/test.txt")

    expect(await fs.exists("/test.txt")).toEqual(false)
    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)
  })
  test("add file deep", async () => {
    fs.clean()
    resetChangelog()

    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)

    await fs.writeFile("/test.txt", "hello world")
    await fs.writeFile("/test.txt", "hello world 2")
    await fs.restore("/test.txt")

    expect(await fs.exists("/test.txt")).toEqual(false)
    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)
  })
  test("modified file", async () => {
    fs.clean()
    await fs.writeFile("/test.txt", "hello world")
    resetChangelog()

    await fs.writeFile("/test.txt", "hello world 2")
    await fs.restore("/test.txt")

    expect(await fs.exists("/test.txt")).toEqual(true)
    expect((await fs.lstat("/test.txt")).isFile()).toEqual(true)
    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)
  })
  test("delete file", async () => {
    fs.clean()

    await fs.writeFile("/test.txt", "hello")
    resetChangelog()

    await fs.unlink("/test.txt")
    await fs.restore("/test.txt")

    expect(
      (await fs.exists("/test.txt")) && (await fs.lstat("/test.txt")).isFile()
    ).toEqual(true)
    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)
  })
  test("rename file", async () => {
    fs.clean()

    await fs.writeFile("/test.txt", "hello world")
    resetChangelog()
    await fs.rename("/test.txt", "/test2.txt")
    await fs.restore("/test.txt")
    await fs.restore("/test2.txt")

    expect(
      (await fs.exists("/test.txt")) && (await fs.lstat("/test.txt")).isFile()
    ).toEqual(true)
    expect(await fs.exists("/test2.txt")).toEqual(false)
    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)
  })
  test("rename dir", async () => {
    fs.clean()
    await fs.mkdir("/folder-test")
    await fs.writeFile("/folder-test/test.txt", "hello world")

    resetChangelog()

    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)

    await fs.rename("/folder-test", "/folder-test2")
    await fs.restore("/folder-test")
    await fs.restore("/folder-test2")

    expect(
      (await fs.exists("/folder-test/test.txt")) &&
        (await fs.lstat("/folder-test/test.txt")).isFile()
    ).toEqual(true)
    expect(
      (await fs.exists("/folder-test2")) &&
        (await fs.lstat("/folder-test2")).isDirectory()
    ).toEqual(true)
    expect(fs.changelog).toEqual({
      "folder-test": {},
      "folder-test2": {}
    })
    expect(fs.changelogLength.value).toEqual(0)
  })
  test("delete dir", async () => {
    fs.clean()
    await fs.mkdir("/folder-test")
    await fs.writeFile("/folder-test/test.txt", "hello world")

    resetChangelog()

    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)

    await fs.unlink("/folder-test")
    await fs.restore("/folder-test")

    expect((await fs.lstat("/folder-test/test.txt")).isFile()).toEqual(true)
    expect(fs.changelog).toEqual({
      "folder-test": {}
    })
    expect(fs.changelogLength.value).toEqual(0)
  })
  test("mixed: rm & mv & restore", async () => {
    fs.clean()

    await fs.mkdir("/test")
    await fs.writeFile("/test/index", "test")
    await fs.writeFile("/test2", "")
    resetChangelog()

    await fs.unlink("/test")
    await fs.rename("/test2", "/test")
    await fs.writeFile("/test", "hello world")
    await fs.writeFile("/test", "")
    expect(fs.changelog).toEqual({
      test: {
        [KEY_DIFF_OBJECT_MIXED]: {
          index: {
            [KEY_ACTION]: "DELETED",
            [KEY_OLD_VALUE]: "test"
          }
        },
        [KEY_DIFF_DIFF_MIXED]: {
          [KEY_ACTION]: "ADDED"
        }
      },
      test2: {
        [KEY_ACTION]: "DELETED",
        [KEY_OLD_VALUE]: ""
      }
    })
    await fs.rename("/test", "/test2")
    expect(fs.changelog).toEqual({
      test: {
        index: {
          [KEY_ACTION]: "DELETED",
          [KEY_OLD_VALUE]: "test"
        }
      }
    })
    await fs.restore("/test")
    expect((await fs.lstat("/test/index")).isFile()).toEqual(true)
    expect((await fs.lstat("/test2")).isFile()).toEqual(true)
    expect(fs.changelog).toEqual({
      test: {}
    })
    expect(fs.changelogLength.value).toEqual(0)
  })
  test("mixed: delete file & create dir", async () => {
    fs.clean()
    await fs.writeFile("/test.txt", "hello world")

    resetChangelog()

    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)

    await fs.unlink("/test.txt")

    await fs.mkdir("/test.txt")
    await fs.writeFile("/test.txt/test.bat", "echo hello world")
    await fs.restore("/test.txt")

    expect((await fs.lstat("/test.txt")).isFile()).toEqual(true)
    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)
  })
  test("mixed: delete file & create dir deep", async () => {
    fs.clean()
    resetChangelog()
    await fs.writeFile("/test.txt", "hello world")

    resetChangelog()

    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)

    await fs.unlink("/test.txt")

    await fs.mkdir("/test.txt")
    await fs.writeFile("/test.txt/test.bat", "echo hello world")
    await fs.writeFile("/test.txt/test.bat2", "echo hello world")

    expect(fs.changelog).toEqual({
      "test.txt": {
        [KEY_DIFF_OBJECT_MIXED]: {
          [KEY_ACTION]: "DELETED",
          [KEY_OLD_VALUE]: "hello world"
        },
        [KEY_DIFF_DIFF_MIXED]: {
          "test.bat": {
            [KEY_ACTION]: "ADDED",
            [KEY_OLD_VALUE]: undefined
          },
          "test.bat2": {
            [KEY_ACTION]: "ADDED",
            [KEY_OLD_VALUE]: undefined
          }
        }
      }
    })
    expect(fs.changelogLength.value).toEqual(3)

    await fs.restore("/test.txt")

    expect((await fs.lstat("/test.txt")).isFile()).toEqual(true)
    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)
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
        [KEY_DIFF_OBJECT_MIXED]: {
          index: {
            [KEY_ACTION]: "DELETED",
            [KEY_OLD_VALUE]: "test"
          }
        },
        [KEY_DIFF_DIFF_MIXED]: {
          [KEY_ACTION]: "ADDED",
          [KEY_OLD_VALUE]: undefined
        }
      },
      test2: {
        [KEY_ACTION]: "DELETED",
        [KEY_OLD_VALUE]: ""
      }
    })

    await fs.restore("/test")
    await fs.restore("/test2")

    expect((await fs.lstat("/test/index")).isFile()).toEqual(true)
    expect((await fs.lstat("/test2")).isFile()).toEqual(true)
    expect(fs.changelog).toEqual({ test: {} })
    expect(fs.changelogLength.value).toEqual(0)
  })
  test("mixed: delete dir & create file deep", async () => {
    fs.clean()

    await fs.mkdir("/test")
    await fs.writeFile("/test/index", "test")
    await fs.writeFile("/test2", "")
    resetChangelog()

    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)

    await fs.unlink("/test")
    await fs.rename("/test2", "/test")
    await fs.writeFile("/test", "hello world")

    expect(fs.changelog).toEqual({
      test: {
        [KEY_DIFF_OBJECT_MIXED]: {
          index: {
            [KEY_ACTION]: "DELETED",
            [KEY_OLD_VALUE]: "test"
          }
        },
        [KEY_DIFF_DIFF_MIXED]: {
          [KEY_ACTION]: "ADDED",
          [KEY_OLD_VALUE]: undefined
        }
      },
      test2: {
        [KEY_ACTION]: "DELETED",
        [KEY_OLD_VALUE]: ""
      }
    })

    await fs.restore("/test")
    await fs.restore("/test2")

    expect((await fs.lstat("/test/index")).isFile()).toEqual(true)
    expect((await fs.lstat("/test2")).isFile()).toEqual(true)
    expect(fs.changelog).toEqual({ test: {} })
    expect(fs.changelogLength.value).toEqual(0)
  })
})
describe("commit", () => {
  const fs = new InMemoryFS()

  function resetChangelog() {
    fs.resetChangelog()
    fs.changelogLength.value = 0
  }

  test("add file", async () => {
    fs.clean()
    resetChangelog()

    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)

    await fs.writeFile("/test.txt", "hello world")

    expect(await fs.commit("/")).toEqual({
      "test#dot;txt": "hello world"
    })
  })

  test("add file deep", async () => {
    fs.clean()
    resetChangelog()

    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)

    await fs.writeFile("/test.txt", "hello world")
    await fs.writeFile("/test.txt", "hello world 2")

    expect(await fs.commit("/")).toEqual({
      "test#dot;txt": "hello world 2"
    })
  })
  test("modified file", async () => {
    fs.clean()
    await fs.writeFile("/test.txt", "hello world")
    resetChangelog()

    await fs.writeFile("/test.txt", "hello world 2")

    expect(await fs.commit("/")).toEqual({
      "test#dot;txt": "hello world 2"
    })

    await fs.writeFile("/test.txt", "hello world 3")

    expect(await fs.commit("/")).toEqual({
      "test#dot;txt": "hello world 3"
    })
  })
  test("delete file", async () => {
    fs.clean()

    await fs.writeFile("/test.txt", "hello")
    resetChangelog()

    await fs.unlink("/test.txt")

    expect(await fs.commit("/")).toEqual({
      "test#dot;txt": deleteField()
    })
  })
  test("rename file", async () => {
    fs.clean()

    await fs.writeFile("/test.txt", "hello world")
    resetChangelog()
    await fs.rename("/test.txt", "/test2.txt")

    expect(await fs.commit("/")).toEqual({
      "test#dot;txt": deleteField(),
      "test2#dot;txt": "hello world"
    })
  })
  test("rename dir", async () => {
    fs.clean()
    await fs.mkdir("/folder-test")
    await fs.writeFile("/folder-test/test.txt", "hello world")

    resetChangelog()

    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)

    await fs.rename("/folder-test", "/folder-test2")

    expect(await fs.commit("/")).toEqual({
      "folder-test2.test#dot;txt": "hello world",
      "folder-test.test#dot;txt": deleteField()
    })
  })
  test("delete dir", async () => {
    fs.clean()
    await fs.mkdir("/folder-test")
    await fs.writeFile("/folder-test/test.txt", "hello world")

    resetChangelog()

    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)

    await fs.unlink("/folder-test")

    expect(await fs.commit("/")).toEqual({
      "folder-test.test#dot;txt": deleteField()
    })
  })
  test("mixed: rm & mv & restore", async () => {
    fs.clean()

    await fs.mkdir("/test")
    await fs.writeFile("/test/index", "test")
    await fs.writeFile("/test2", "")
    resetChangelog()

    await fs.unlink("/test")
    await fs.rename("/test2", "/test")
    await fs.writeFile("/test", "hello world")
    await fs.writeFile("/test", "")
    expect(fs.changelog).toEqual({
      test: {
        [KEY_DIFF_OBJECT_MIXED]: {
          index: {
            [KEY_ACTION]: "DELETED",
            [KEY_OLD_VALUE]: "test"
          }
        },
        [KEY_DIFF_DIFF_MIXED]: {
          [KEY_ACTION]: "ADDED"
        }
      },
      test2: {
        [KEY_ACTION]: "DELETED",
        [KEY_OLD_VALUE]: ""
      }
    })
    await fs.rename("/test", "/test2")

    expect(await fs.commit("/")).toEqual({
      "test.index": deleteField()
    })
  })
  test("mixed: delete file & create dir", async () => {
    fs.clean()
    await fs.writeFile("/test.txt", "hello world")

    resetChangelog()

    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)

    await fs.unlink("/test.txt")

    await fs.mkdir("/test.txt")
    await fs.writeFile("/test.txt/test.bat", "echo hello world")

    expect(await fs.commit("/")).toEqual({
      "test#dot;txt.test#dot;bat": "echo hello world"
    })
  })
  test("mixed: delete file & create dir deep", async () => {
    fs.clean()
    resetChangelog()
    await fs.writeFile("/test.txt", "hello world")

    resetChangelog()

    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)

    await fs.unlink("/test.txt")

    await fs.mkdir("/test.txt")
    await fs.writeFile("/test.txt/test.bat", "echo hello world")
    await fs.writeFile("/test.txt/test.bat2", "echo hello world")

    expect(fs.changelog).toEqual({
      "test.txt": {
        [KEY_DIFF_OBJECT_MIXED]: {
          [KEY_ACTION]: "DELETED",
          [KEY_OLD_VALUE]: "hello world"
        },
        [KEY_DIFF_DIFF_MIXED]: {
          "test.bat": {
            [KEY_ACTION]: "ADDED",
            [KEY_OLD_VALUE]: undefined
          },
          "test.bat2": {
            [KEY_ACTION]: "ADDED",
            [KEY_OLD_VALUE]: undefined
          }
        }
      }
    })
    expect(fs.changelogLength.value).toEqual(3)

    expect(await fs.commit("/")).toEqual({
      "test#dot;txt.test#dot;bat": "echo hello world",
      "test#dot;txt.test#dot;bat2": "echo hello world"
    })
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
        [KEY_DIFF_OBJECT_MIXED]: {
          index: {
            [KEY_ACTION]: "DELETED",
            [KEY_OLD_VALUE]: "test"
          }
        },
        [KEY_DIFF_DIFF_MIXED]: {
          [KEY_ACTION]: "ADDED",
          [KEY_OLD_VALUE]: undefined
        }
      },
      test2: {
        [KEY_ACTION]: "DELETED",
        [KEY_OLD_VALUE]: ""
      }
    })

    expect(await fs.commit("/")).toEqual({
      test: "",
      test2: deleteField()
    })
  })
  test("mixed: delete dir & create file deep", async () => {
    fs.clean()

    await fs.mkdir("/test")
    await fs.writeFile("/test/index", "test")
    await fs.writeFile("/test2", "")
    resetChangelog()

    expect(fs.changelog).toEqual({})
    expect(fs.changelogLength.value).toEqual(0)

    await fs.unlink("/test")
    await fs.rename("/test2", "/test")
    await fs.writeFile("/test", "hello world")

    expect(fs.changelog).toEqual({
      test: {
        [KEY_DIFF_OBJECT_MIXED]: {
          index: {
            [KEY_ACTION]: "DELETED",
            [KEY_OLD_VALUE]: "test"
          }
        },
        [KEY_DIFF_DIFF_MIXED]: {
          [KEY_ACTION]: "ADDED",
          [KEY_OLD_VALUE]: undefined
        }
      },
      test2: {
        [KEY_ACTION]: "DELETED",
        [KEY_OLD_VALUE]: ""
      }
    })

    expect(await fs.commit("/")).toEqual({
      test: "hello world",
      test2: deleteField()
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
