import type { Data } from "vue-console-feed/encode"
import { _getListLink, Encode, readLinkObject } from "vue-console-feed/encode"
import { Table } from "vue-console-feed/table"

console.log("transport-console actived!")

const methodsPort = ["log", "warn", "error"]
methodsPort.forEach((name) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fn = (console as unknown as any)[name]

  // eslint-disable-next-line functional/functional-parameters, @typescript-eslint/no-explicit-any
  ;(console as unknown as any)[name] = function (...args: any[]) {
    parent.postMessage({
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
    parent.postMessage({
      type: "console",
      name: "table",
      args: {
        table: Table(value),
        value: Encode(value, true, true)
      }
    })
  else
    parent.postMessage({
      type: "console",
      name: "log",
      args: Encode(value, true, true)
    })

  return table.call(this, value)
}

addEventListener("error", (event) => {
  parent.postMessage({
    type: "error",
    args: Encode(event.error, true, true)
  })
})

window.addEventListener(
  "message",
  (
    event: MessageEvent<{
      id: string
      type: "getListLink" | "readLinkObject"
      link: Data.Link
    }>
  ) => {
    switch (event.data.type) {
      case "getListLink":
        parent.postMessage({
          id: event.data.id,
          result: _getListLink(event.data.link)
        })
        break
      case "readLinkObject":
        parent.postMessage({
          id: event.data.id,
          result: readLinkObject(event.data.link)
        })
        break
    }

    // id, result
  }
)
