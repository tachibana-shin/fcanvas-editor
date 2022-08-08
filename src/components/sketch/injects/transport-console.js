for (const name in console) {
  const fn = console[name]

  // eslint-disable-next-line functional/functional-parameters
  console[name] = function (...messages) {
    parent.postMessage({
      type: `console.${name}`,
      args: JSON.stringify(messages)
    })
    return fn.call(this, ...messages)
  }
}

addEventListener("error", (event) => {
  parent.postMessage({
    type: "error",
    col: event.colno,
    line: event.lineno,
    filename: event.filename,
    message: event.message,
    error: {
      message: event.error.message,
      stack: event.error.stack
    }
  })
})
