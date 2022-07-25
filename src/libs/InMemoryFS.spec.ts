import { describe, expect, test } from "vitest"

import { InMemoryFS } from "./InMemoryFS"

describe("InMemoryFS", () => {
  const fs = new InMemoryFS()

  test("writeFile", async () => {
    await fs.clean()

    await fs.writeFile("/test.txt", "hello world")

    expect(await fs.readFile("/test.txt")).toEqual("hello world")

    await fs.writeFile("/test.txt", "hello world2")

    expect(await fs.readFile("/test.txt")).toEqual("hello world2")

    await fs.mkdir("/examples")

    await expect(fs.writeFile("/examples", "")).rejects.toThrowError("IS_DIR")
  })

  test("readFile", async () => {
    await fs.clean()

    await fs.writeFile("/test.txt", "hello world")

    expect(await fs.readFile("/test.txt")).toEqual("hello world")

    await fs.clean()

    await expect(fs.readFile("/test.txt")).rejects.toThrowError("NOT_EXISTS")
  })

  test("mkdir", async () => {
    await fs.clean()

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
      await fs.clean()

      await fs.mkdir("/examples")

      expect(await fs.exists("/examples")).toEqual(true)
      expect((await fs.lstat("/examples")).isDirectory()).toEqual(true)

      await fs.rename("/examples", "/examples-rename")

      expect(await fs.exists("/examples")).toEqual(false)
      expect((await fs.lstat("/examples-rename")).isDirectory()).toEqual(true)
    })

    test("file", async () => {
      await fs.clean()

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
      await fs.clean()

      await fs.mkdir("/examples")

      expect((await fs.lstat("/examples")).isDirectory()).toEqual(true)

      await fs.unlink("/examples")

      expect(await fs.exists("/examples")).toEqual(false)
    })

    test("file", async () => {
      await fs.clean()

      await fs.writeFile("/test.txt", "hello world")

      expect((await fs.lstat("/test.txt")).isFile()).toEqual(true)

      await fs.unlink("/test.txt")

      expect(await fs.exists("/test.txt")).toEqual(false)
    })
  })

  describe("lstat", () => {
    test("isFile", async () => {
      await fs.clean()

      await expect(fs.lstat("/test.txt")).rejects.toThrowError("NOT_EXISTS")

      await fs.writeFile("/test.txt", "hello world")

      expect((await fs.lstat("/test.txt")).isFile()).toEqual(true)
      expect((await fs.lstat("/test.txt")).isDirectory()).toEqual(false)
    })
    test("isDirectory", async () => {
      await fs.clean()

      await expect(fs.lstat("examples")).rejects.toThrowError("NOT_EXISTS")

      await fs.mkdir("/examples")

      expect((await fs.lstat("/examples")).isDirectory()).toEqual(true)
      expect((await fs.lstat("/examples")).isFile()).toEqual(false)
    })
  })

  describe("readdir", () => {
    test("in root", async () => {
      await fs.clean()

      expect(await fs.readdir("/")).toEqual([])

      await fs.mkdir("/examples")

      expect(await fs.readdir("/")).toEqual(["examples"])
    })
    test("in children", async () => {
      await fs.clean()

      await expect(fs.readdir("/examples")).rejects.toThrowError("NOT_EXISTS")

      await fs.mkdir("/examples")
      await fs.writeFile("/examples/test.txt", "hello world")

      expect(await fs.readdir("/examples")).toEqual(["test.txt"])
    })
  })

  describe("exists", () => {
    test("file", async () => {
      await fs.clean()

      expect(await fs.exists("/test.txt")).toEqual(false)
      await fs.writeFile("/test.txt", "hello world")
      expect(await fs.exists("/test.txt")).toEqual(true)
    })
    test("directory", async () => {
      await fs.clean()

      expect(await fs.exists("/examples")).toEqual(false)
      await fs.mkdir("/examples")
      expect(await fs.exists("/examples")).toEqual(true)
    })
  })
})
