import { sprintf } from "sprintf-js"
import type { Data } from "vue-console-feed/encode"
import {
  _getListLink,
  callFnLink,
  clearLinkStore,
  Encode,
  readLinkObject
} from "vue-console-feed/encode"
import { Table } from "vue-console-feed/table"

export type Methods = "log" | "warn" | "error" | "info" | "debug"
export interface MessageConsoleTable {
  type: "console"
  name: "table"
  args: ReturnType<typeof Table>
}
export interface MessageConsoleEncode {
  type: "console"
  name: Methods
  args: ReturnType<typeof Encode>[]
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

const methodsPort: Methods[] = ["log", "warn", "error", "info", "debug"]
methodsPort.forEach((name) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fn = (console as unknown as any)[name]

  // eslint-disable-next-line functional/functional-parameters, @typescript-eslint/no-explicit-any
  ;(console as unknown as any)[name] = function (...args: any[]) {
    postMessageToParent({
      type: "console",
      name,
      args:
        args[0]?.includes?.("%") && typeof args[0] === "string"
          ? [Encode(sprintf(args[0], ...args.slice(1)), true, true)]
          : args.map((item) => Encode(item, true, true))
    })

    const mess = new Error().stack?.toString().split("\n", 3)[2]
    const location = mess?.slice(mess.lastIndexOf("(") + 1, -1)

    fn.apply(this, [{ location }])
    return fn.apply(this, args)
  }
})

const { table } = console
console.table = function (value: unknown) {
  if (value !== null && typeof value === "object")
    postMessageToParent({
      type: "console",
      name: "table",
      args:Table(value)
    })
  else
    postMessageToParent({
      type: "console",
      name: "log",
      args: [Encode(value, true, true)]
    })

  return table.call(this, value)
}

addEventListener("error", (event) => {
  postMessageToParent({
    type: "console",
    name: "error",
    args: [Encode(event.error, true, true)]
  })
})

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
