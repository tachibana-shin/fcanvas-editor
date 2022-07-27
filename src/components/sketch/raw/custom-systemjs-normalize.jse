// eslint-disable-next-line functional/no-let
let id = 0
function getURLFile(filepath) {
  return new Promise((resolve, reject) => {
    const uid = id++ + ""
    const handle = (event) => {
      if (event.data.id === uid && event.data.type === "GET_URL") {
        // this event
        // console.log(event.data)
        if (event.data.error) reject(new Error(event.data.error))
        else resolve(event.data.filepath)

        window.removeEventListener("message", handle)
      }
    }
    window.addEventListener("message", handle)
    parent.postMessage({
      id: uid,
      type: "GET_URL",
      filepath
    })
  })
}
const { normalize } = System

// eslint-disable-next-line functional/immutable-data
System.normalize = async function (path) {
  const pathResolved = await normalize.call(this, path)

  const inSystem = pathResolved.startsWith(parent.location.href)

  if (inSystem) {
    // eslint-disable-next-line n/no-unsupported-features/node-builtins
    return await getURLFile(new URL(pathResolved).pathname).catch(
      () => pathResolved
    )
    // resolve file system startsWith parent.location.href
  }

  return pathResolved
}

// eslint-disable-next-line functional/immutable-data
window.getURLFile = getURLFile
