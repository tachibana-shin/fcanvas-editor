import type { Data } from "vue-console-feed/encode"
import {
  _getListLink,
  callFnLink,
  Encode,
  readLinkObject
} from "vue-console-feed/encode"
import { Table } from "vue-console-feed/table"

const methodsPort = ["log", "warn", "error"]

export type MessageConsoleEncode =
  | {
      type: "console"
      name: typeof methodsPort[0]
      args: ReturnType<typeof Encode>[]
    }
  | {
      type: "console"
      name: "table"
      args: {
        table: ReturnType<typeof Table>
        value: ReturnType<typeof Encode>
      }
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
      type: "callFnLinkAsync"
      id: string
      result: ReturnType<typeof callFnLink>
    }

function postMessageToParent(message: MessageConsoleEncode | MessageAPI) {
  parent.postMessage(message, {
    targetOrigin: "*"
  })
}

methodsPort.forEach((name) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fn = (console as unknown as any)[name]

  // eslint-disable-next-line functional/functional-parameters, @typescript-eslint/no-explicit-any
  ;(console as unknown as any)[name] = function (...args: any[]) {
    postMessageToParent({
      type: "console",
      name,
      args: args.map((item) => Encode(item, true, true))
    })

    return fn.apply(this, args)
  }
})

const { table } = console
console.table = function (value: unknown) {
  if (value !== null && typeof value === "object")
    postMessageToParent({
      type: "console",
      name: "table",
      args: {
        table: Table(value),
        value: Encode(value, true, true)
      }
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
      type: "getListLink" | "readLinkObject" | "callFnLinkAsync"
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
      case "callFnLinkAsync":
        postMessageToParent({
          type: "callFnLinkAsync",
          id: event.data.id,
          result: callFnLink(event.data.link)
        })
        break
    }

    // id, result
  }
)
