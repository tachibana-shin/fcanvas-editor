/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DataAPI } from "vue-console-feed/data-api"
import { printfArgs } from "vue-console-feed/data-api"
import type { Data } from "vue-console-feed/encode"
import {
  _getListLink,
  callFnLink,
  clearLinkStore,
  Encode,
  readLinkObject
} from "vue-console-feed/encode"
import { Table } from "vue-console-feed/table"

export type Methods = Exclude<keyof DataAPI, "value">
export interface MessageConsoleTable {
  type: "console"
  name: "table"
  args: [ReturnType<typeof Table>]
}
export interface MessageConsoleEncode {
  type: "console"
  name: Methods
  args: ReturnType<typeof Encode>[] | [string]
}

export type MessageAPI =
  | {
      type: "getListLink"
      id: string
      result: ReturnType<typeof _getListLink>
    }
  | {
      type: "readLinkObject"
      id: string
      result: ReturnType<typeof readLinkObject>
    }
  | {
      type: "callFnLink"
      id: string
      result: ReturnType<typeof callFnLink>
    }

function postMessageToParent(
  message: MessageConsoleEncode | MessageConsoleTable | MessageAPI
) {
  parent.postMessage(message, {
    targetOrigin: "*"
  })
}

// ===== console API ======
/**
 *
    clear(): void;
 */
;(["log", "warn", "info", "debug", "error"] as Methods[]).forEach((name) => {
  const cbRoot = (console as unknown as any)[name]
  // eslint-disable-next-line functional/functional-parameters
  ;(console as unknown as any)[name] = function (...args: unknown[]) {
    postMessageToParent({
      type: "console",
      name,
      args: printfArgs(args).map((item: unknown) => Encode(item, 2))
    })

    cbRoot.apply(this, args)
  }
})
const { table } = console
console.table = function (value: unknown) {
  if (value !== null && typeof value === "object")
    postMessageToParent({
      type: "console",
      name: "table",
      args: [Table(value, 1)]
    })
  else
    postMessageToParent({
      type: "console",
      name: "log",
      args: [Encode(value, 1)]
    })
  console.log(Encode(value, 1), { stack: new Error().stack })
  return table.call(this, value)
}
;(["group", "groupEnd"] as Methods[]).forEach((name) => {
  const cbRoot = (console as unknown as any)[name]
  ;(console as unknown as any)[name] = function (value?: unknown) {
    postMessageToParent({
      type: "console",
      name,
      args: value !== undefined ? [Encode(value, 1)] : []
    })

    cbRoot.call(this, value)
  }
})
;(["count", "countReset", "time", "timeLog", "timeEnd"] as Methods[]).forEach(
  (name) => {
    const cbRoot = (console as unknown as any)[name]
    ;(console as unknown as any)[name] = function (value?: unknown) {
      postMessageToParent({
        type: "console",
        name,
        args: value !== undefined ? [Encode(value + "", 1)] : []
      })

      cbRoot.call(this, value)
    }
  }
)
const { clear } = console
console.clear = function () {
  postMessageToParent({
    type: "console",
    name: "clear",
    args: []
  })

  clear.call(this)
}
// ========================

// ===== error globals ====
addEventListener("error", (event) => {
  postMessageToParent({
    type: "console",
    name: "error",
    args: [Encode(event.error, 1)]
  })
})
// ========================

// ====== API Async ======
window.addEventListener(
  "message",
  (
    event: MessageEvent<{
      id: string
      type: MessageAPI["type"]
      link: Data.Link
    }>
  ) => {
    switch (event.data.type) {
      case "getListLink":
        postMessageToParent({
          type: "getListLink",
          id: event.data.id,
          result: _getListLink(event.data.link)
        })
        break
      case "readLinkObject":
        postMessageToParent({
          type: "readLinkObject",
          id: event.data.id,
          result: readLinkObject(event.data.link)
        })
        break
      case "callFnLink":
        postMessageToParent({
          type: "callFnLink",
          id: event.data.id,
          result: callFnLink(event.data.link)
        })
        break
    }

    // id, result
  }
)
window.addEventListener(
  "message",
  (event: MessageEvent<{ type: "clearConsole" }>) => {
    if (event.data.type === "clearConsole") {
      console.clear()
      clearLinkStore()
    }
  }
)
// =======================
