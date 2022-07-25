import { describe, expect, test } from "vitest"

import { InMemoryFS } from "./InMemoryFS"

describe("InMemoryFS", () => {
  const fs = new InMemoryFS()

  test("writeFile", () => {
    fs.clean()

    fs.writeFile("/test.txt", "hello world")

    expect(fs.readFile("/test.txt")).toEqual("hello world")

    fs.writeFile("/test.txt", "hello world2")

    expect(fs.readFile("/test.txt")).toEqual("hello world2")

    fs.mkdir("/examples")

    expect(() => fs.writeFile("/examples", "")).toThrowError("IS_DIR")
  })

  test("readFile", () => {
    fs.clean()

    fs.writeFile("/test.txt", "hello world")

    expect(fs.readFile("/test.txt")).toEqual("hello world")

    fs.clean()

    expect(() => fs.readFile("/test.txt")).toThrowError("NOT_EXISTS")
  })

  test("mkdir", () => {
    fs.clean()

    fs.mkdir("/examples")
    fs.writeFile("/test.txt", "")

    expect(fs.lstat("/examples").isDirectory()).toEqual(true)
    expect(fs.lstat("/test.txt").isDirectory()).toEqual(false)

    expect(() => fs.mkdir("/examples")).toThrowError("IS_DIR: /examples")
    expect(() => fs.mkdir("/test.txt")).toThrowError("IS_FILE: /test.txt")
  })

  describe("rename", () => {
    test("dir", () => {
      fs.clean()

      fs.mkdir("/examples")

      expect(fs.exists("/examples")).toEqual(true)
      expect(fs.lstat("/examples").isDirectory()).toEqual(true)

      fs.rename("/examples", "/examples-rename")

      expect(fs.exists("/examples")).toEqual(false)
      expect(fs.lstat("/examples-rename").isDirectory()).toEqual(true)
    })

    test("file", () => {
      fs.clean()

      fs.writeFile("/test.txt", "hello world")

      expect(fs.exists("/test.txt")).toEqual(true)
      expect(fs.lstat("/test.txt").isFile()).toEqual(true)

      fs.rename("/test.txt", "/test-rename.txt")

      expect(fs.exists("/test.txt")).toEqual(false)
      expect(fs.lstat("/test-rename.txt").isFile()).toEqual(true)
    })
  })

  describe("unlink", () => {
    test("dir", () => {
      fs.clean()

      fs.mkdir("/examples")

      expect(fs.lstat("/examples").isDirectory()).toEqual(true)

      fs.unlink("/examples")

      expect(fs.exists("/examples")).toEqual(false)
    })

    test("file", () => {
      fs.clean()

      fs.writeFile("/test.txt", "hello world")

      expect(fs.lstat("/test.txt").isFile()).toEqual(true)

      fs.unlink("/test.txt")

      expect(fs.exists("/test.txt")).toEqual(false)
    })
  })

  describe("lstat", () => {
    test("isFile", () => {
      fs.clean()

      expect(() => fs.lstat("/test.txt")).toThrowError("NOT_EXISTS")

      fs.writeFile("/test.txt", "hello world")

      expect(fs.lstat("/test.txt").isFile()).toEqual(true)
      expect(fs.lstat("/test.txt").isDirectory()).toEqual(false)
    })
    test("isDirectory", () => {
      fs.clean()

      expect(() => fs.lstat("examples")).toThrowError("NOT_EXISTS")

      fs.mkdir("/examples")

      expect(fs.lstat("/examples").isDirectory()).toEqual(true)
      expect(fs.lstat("/examples").isFile()).toEqual(false)
    })
  })

  describe("readdir", () => {
    test("in root", () => {
      fs.clean()

      expect(fs.readdir("/")).toEqual([])

      fs.mkdir("/examples")

      expect(fs.readdir("/")).toEqual(["examples"])
    })
    test("in children", () => {
      fs.clean()

      expect(() => fs.readdir("/examples")).toThrowError("NOT_EXISTS")

      fs.mkdir("/examples")
      fs.writeFile("/examples/test.txt", "hello world")

      expect(fs.readdir("/examples")).toEqual(["test.txt"])
    })
  })

  describe("exists", () => {
    test("file", () => {
      fs.clean()

      expect(fs.exists("/test.txt")).toEqual(false)
      fs.writeFile("/test.txt", "hello world")
      expect(fs.exists("/test.txt")).toEqual(true)
    })
    test("directory", () => {
      fs.clean()

      expect(fs.exists("/examples")).toEqual(false)
      fs.mkdir("/examples")
      expect(fs.exists("/examples")).toEqual(true)
    })
  })
})
