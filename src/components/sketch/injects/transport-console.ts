import { Encode } from "vue-console-feed/encode"

console.log("transport-console actived!")
for (const name in console) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fn = (console as unknown as any)[name]
  // eslint-disable-next-line functional/functional-parameters, @typescript-eslint/no-explicit-any
  ;(console as unknown as any)[name] = function (...messages: any[]) {
    parent.postMessage({
      type: `console.${name}`,
      args: messages.map((item) => Encode(item, true, true))
    })
    return fn.call(this, ...messages)
  }
}

addEventListener("error", (event) => {
  parent.postMessage({
    type: "error",
    args: Encode(event.error, true, true)
  })
})
