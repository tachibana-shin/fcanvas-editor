// import { Blob } from "buffer"
import esbuildWASM from "esbuild-wasm"
import esbuildDotWASM from "esbuild-wasm/esbuild.wasm?url"
// const esbuildDotWASM = ""
import { extname } from "path-browserify"
import { fs, isPathChange } from "src/modules/fs"

import { pathToMatch } from "./helpers/path-to-match"
import { resolveImport } from "./helpers/resolve-import"
import { resolvePath } from "./helpers/resolve-path"

export interface InfoFileMap {
  blob: string
  dependencies: Set<string>
  count: number
}
// global.Blob = Blob
type ObjectUrlMap = Map<string, InfoFileMap | number>

// eslint-disable-next-line functional/no-let
let esbuildLoaded = false

async function buildToBlob(filepath: string, content: string) {
  // first. Compile file main. after compile, add dependencies to dependencies.
  switch (extname(filepath)) {
    case ".ts":
      if (!esbuildLoaded) {
        await esbuildWASM.initialize({
          wasmURL: esbuildDotWASM
        })
        esbuildLoaded = true
      }

      content = (
        await esbuildWASM.transform(content, {
          loader: "ts"
        })
      ).code
  }

  const blob = URL.createObjectURL(
    new Blob([content], {
      type: "text/javascript"
    })
  )

  return blob
}

/**
 *
 * @param filepath - string
 * @param objectURLMap - Map<string, string>
 * @returns Map<string, string> is example
 * @example Return = { "/src/main.js": "blob:...." }
 */
export async function compiler(
  filepath: string,
  objectURLMap: ObjectUrlMap = new Map(),
  isDepend = false,
  forceBuild = false
): Promise<Map<string, InfoFileMap>> {
  console.log("compiler: start build %s", filepath)
  const dependencies: Set<string> = new Set()

  const promises: Promise<string[]>[] = []

  const content = resolveImport(
    await fs.readFile(filepath),
    (path, type, scap) => {
      const r = resolvePath(filepath, path)

      if (r.startsWith("~/")) {
        if (scap === "`" && type.startsWith("import")) {
          // this is request dynamic import template. ex: import(`/assets/${name}.jpg`)
          // we need to resolve path to absolute path
          // hmmm, this is not good, we need to use absolute path to resolve dynamic import
          // but we need to use absolute path to resolve dynamic import
          // so we need to use absolute path to resolve dynamic import
          const reg = pathToMatch(r.slice(1))
          console.warn("compiler: dynamic import %s", reg)
          promises.push(fs.globby(reg))
        } else {
          // normal
          dependencies.add(r.slice(1))
        }
      }

      return r
    }
  )
  ;(await Promise.all(promises)).forEach((files) => {
    files.forEach((file) => {
      dependencies.add(file)
    })
  })

  const newDependencies = new Set<string>()
  // re make build file
  dependencies.forEach((item) => {
    newDependencies.add(item)

    const obj = objectURLMap.get(item)
    if (typeof obj === "object") obj.count++
    else objectURLMap.set(item, (obj ?? 0) + 1)
  })
  const inMap = objectURLMap.get(filepath)

  // console.log({filepath, dependencies,inMap, objectURLMap})
  if (typeof inMap === "object") {
    inMap.dependencies.forEach((item) => {
      const obj = objectURLMap.get(item)

      if (!obj) return
      if (dependencies.has(item)) {
        // inMap.count++
        return
      }

      if (typeof obj === "object") {
        obj.count--

        if (obj.count <= 0) deleteIfChanged(item, objectURLMap)
      } else {
        if (obj <= 1) objectURLMap.delete(item)
        else objectURLMap.set(item, obj - 1)
      }
    })
    inMap.dependencies.clear()
    newDependencies.forEach((item) => inMap.dependencies.add(item))
    if (forceBuild) {
      URL.revokeObjectURL(inMap.blob)
      inMap.blob = await buildToBlob(filepath, content)
    }
  } else {
    // console.log({ inMap, filepath })
    const blob = await buildToBlob(filepath, content)
    const count = objectURLMap.get(filepath)

    objectURLMap.set(filepath, {
      blob,
      dependencies,
      count:
        typeof count === "object" ? count.count : count ?? (isDepend ? 0 : 1)
    })
    // objectURLMap.get(filepath).blob = await buildToBlob(filepath, content)
  }

  const tasks = []
  // done. compile file main.
  // second. Compile dependencies.
  for (const dependency of dependencies) {
    // because dependency like /<file>.ts, so we need to remove ~/
    tasks.push(compiler(dependency, objectURLMap, true))
  }

  await Promise.all(tasks)

  return objectURLMap as unknown as Map<string, InfoFileMap>
}

function deleteIfChanged(filepath: string, objectURLMap: ObjectUrlMap) {
  const t = objectURLMap.get(filepath)

  if (!t) return

  if (typeof t !== "object") {
    console.warn("あらたぶんこれをあerror")
    return
  }
  t.count--

  if (t.count > 0) return

  URL.revokeObjectURL(t.blob)

  t.dependencies.forEach((item) => {
    deleteIfChanged(item, objectURLMap)
  })
  objectURLMap.delete(filepath)
}

export function watchMap(objectURLMap: ObjectUrlMap): () => void {
  // follow all files on objectURLMap // dynamic import not support scan map
  const handler = async (path: string, exists: boolean) => {
    // reactive
    const extra = Array.from(objectURLMap.keys()).some((file) => {
      if (isPathChange(path, file)) {
        return true
      }
      return false
    })

    if (!extra) return

    try {
      const files = await fs.readdir(path)
      await Promise.all(
        files.map(async (name) => {
          const file = `${path}/${name}`

          if (objectURLMap.has(file)) {
            if (exists)
              // if catch is not directory, then repack now
              await compiler(file, objectURLMap, false, true)
            else deleteIfChanged(file, objectURLMap)
          }
        })
      )
    } catch {
      if (objectURLMap.has(path)) {
        console.log("decompiler")
        if (exists)
          // if catch is not directory, then repack now
          await compiler(path, objectURLMap, false, true)
        else deleteIfChanged(path, objectURLMap)
      }
    }
  }

  const handlerWrite = (path: string) => handler(path, true)
  const handlerUnlink = (path: string) => handler(path, false)

  fs.events.on("write", handlerWrite)
  fs.events.on("unlink", handlerUnlink)

  return () => {
    fs.events.off("write", handlerWrite)
    fs.events.off("unlink", handlerUnlink)
  }
}

// main()
// async function main() {
//   fs.clean()

//   await fs.writeFile("/main.js", "import './sub.js'\nimport './sub2.js'")
//   await fs.writeFile("/sub.js", "console.log('hello')")
//   await fs.writeFile("/sub2.js", "import './sub.js'; console.log('hello')")

//   const map = await compiler("/main.js")

//   setTimeout(() => console.log(map))
//   // return await console.log(map)
// }
