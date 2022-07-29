import { describe, expect, test } from "vitest"

import { searchText } from "./search-text"

describe("search-text", () => {
  test("normal search", () => {
    const text = "Hello World"
    const options = {
      search: "Hello",
      caseSensitive: false,
      wholeWord: false,
      regex: false
    }
    const result = Array.from(Array.from(searchText(text, options)))

    expect(result).toEqual([
      {
        index: 0,
        match: "Hello",
        after: " World",
        before: ""
      }
    ])
  })
  test("case sensitive search", () => {
    const text = "Hello World"
    const options = {
      search: "hello",
      caseSensitive: true,
      wholeWord: false,
      regex: false
    }
    const result = Array.from(searchText(text, options))
    expect(result).toEqual([])
  })
  test("whole word search", () => {
    const text = "Hello World"
    const options = {
      search: "Hello",
      caseSensitive: false,
      wholeWord: true,
      regex: false
    }
    const result = Array.from(searchText(text, options))
    expect(result).toEqual([
      {
        index: 0,
        match: "Hello",
        after: " World",
        before: ""
      }
    ])
  })
  test("regex search", () => {
    const text = "Hello World"
    const options = {
      search: "Hello",
      caseSensitive: false,
      wholeWord: false,
      regex: true
    }
    const result = Array.from(searchText(text, options))
    expect(result).toEqual([
      {
        index: 0,
        match: "Hello",
        after: " World",
        before: ""
      }
    ])
  })
  test("regex search with case sensitive", () => {
    const text = "Hello World"
    const options = {
      search: "Hello",
      caseSensitive: true,
      wholeWord: false,
      regex: true
    }
    const result = Array.from(searchText(text, options))
    expect(result).toEqual([
      {
        index: 0,
        match: "Hello",
        after: " World",
        before: ""
      }
    ])
  })
  test("regex search with whole word", () => {
    const text = "Hello World"
    const options = {
      search: "Hello",
      caseSensitive: false,
      wholeWord: true,
      regex: true
    }
    const result = Array.from(searchText(text, options))
    expect(result).toEqual([
      {
        index: 0,
        match: "Hello",
        after: " World",
        before: ""
      }
    ])
  })
  test("regex search with case sensitive and whole word", () => {
    const text = "Hello World"
    const options = {
      search: "Hello",
      caseSensitive: true,
      wholeWord: true,
      regex: true
    }
    const result = Array.from(searchText(text, options))
    expect(result).toEqual([
      {
        index: 0,
        match: "Hello",
        after: " World",
        before: ""
      }
    ])
  })
  test("before text matches", () => {
    const text = "Shin! Hello World"
    const options = {
      search: "Hello",
      caseSensitive: false,
      wholeWord: true,
      regex: true
    }
    const result = Array.from(searchText(text, options))
    expect(result).toEqual([
      {
        index: 6,
        match: "Hello",
        after: " World",
        before: ""
      }
    ])
  })
  test("after text matches", () => {
    const text = "Hello World! Ohayo! Shin"
    const options = {
      search: "Hello",
      caseSensitive: false,
      wholeWord: true,
      regex: true
    }
    const result = Array.from(searchText(text, options))
    expect(result).toEqual([
      {
        index: 0,
        match: "Hello",
        after: " World! Ohayo",
        before: ""
      }
    ])
  })
})
