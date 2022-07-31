/* eslint-disable @typescript-eslint/no-explicit-any */
const CDN_PKG = "https://unpkg.com"

// fetch type from unpkg
// fetch code from cdn.skypack.dev

function fetchPackageJSON(name: string, version: string) {
  return fetch(`${CDN_PKG}/${name}@${version}/package.json`).then((res) =>
    res.text()
  )
}

async function fetchInfoPackage(
  name: string,
  version: string,
  cached = new Map<string, unknown>()
) {
  const pkgText = await fetchPackageJSON(name, version)
  const pkg = JSON.parse(pkgText)
  const types: string = pkg.types ?? pkg.typings
  const pkgIsTypes = name.startsWith("@types/")

  return {
    name: `${name}@${version}`,
    fname: name,
    pkgText,
    types: types && `${name}@${version}/${types}`,
    pkgIsTypes,
    dependencies: (await Promise.all(
      Object.entries(pkg.dependencies ?? {}).map(([name, version]: any) => {
        const inCache = cached.get(`${name}@${version}`)

        if (inCache) return inCache

        const info = fetchInfoPackage(name, version, cached) as any
        cached.set(`${name}@${version}`, info)

        return info
      })
    )) as any,
    exports: Object.entries(pkg.exports || {}).map(([path, info]: any) => {
      return {
        name: `${name}@${version}/${path}`,
        types: info.types?.default ?? info.types,
        exports: []
      }
    }) as unknown
  }
}

function getAllDepends(
  infoPkg: Awaited<ReturnType<typeof fetchInfoPackage>>,
  seed = new Set<string>()
) {
  if (seed.has(`${infoPkg.name}`)) return []

  seed.add(infoPkg.name)

  return [
    infoPkg,
    ...infoPkg.dependencies
      .map((dep: any) => {
        return getAllDepends(dep, seed)
      })
      .flat(1)
  ]
}

async function fetchTypesPackage(name: string, version: string) {
  const pkg = await fetchInfoPackage(name, version)

  return getAllDepends(pkg)
}

async function load(depends: Record<string, string>) {
  const types: {
    text: string
    pkgText: string
    pkgPath: string
    file: string
  }[][] = []

  for (const [name, version] of Object.entries(depends)) {
    const type = await fetchTypesPackage(name, version)

    const thisTypes = (await Promise.all(
      type.map(async ({ fname, pkgText, types }) => {
        if (types === undefined) return undefined

        return {
          text: await fetch(`${CDN_PKG}/${types}`).then((res) => res.text()),
          pkgText,
          pkgPath: `file:///node_modules/${fname}/package.json`,
          file: `file:///node_modules/${fname}/${types
            .split("/")
            .slice(1)
            .join("/")
            .replace("./", "")}`
        }
      })
    ).then((res) => {
      return res.filter((item) => {
        if (item === undefined) return false
        return true
      })
    })) as {
      text: string
      pkgText: string
      pkgPath: string
      file: string
    }[]

    types.push(thisTypes)
  }

  return types.flat(1).reverse()
}

self.addEventListener(
  "message",
  async ({
    data
  }: MessageEvent<{
    id: string
    depends: Record<string, string>
  }>) => {
    postMessage({
      id: data.id,
      types: await load(data.depends)
    })
  }
)
