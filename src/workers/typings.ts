/* eslint-disable @typescript-eslint/no-explicit-any */
const CDN_PKG = "https://cdn.skypack.dev/" // https://unpkg.com/

// fetch type from unpkg
// fetch code from cdn.skypack.dev

function fetchPackageJSON(name: string, version: string) {
  return fetch(`${CDN_PKG}/${name}@${version}/package.json`).then((res) =>
    res.json()
  )
}

async function fetchInfoPackage(
  name: string,
  version: string,
  cached = new Map<string, unknown>()
) {
  const pkg = await fetchPackageJSON(name, version)
  const types: string = pkg.types ?? pkg.typings
  const pkgIsTypes = name.startsWith("@types/")

  return {
    name: `${name}@${version}`,
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

self.addEventListener(
  "message",
  async ({
    data
  }: MessageEvent<{
    id: string
    pkg: string
    version: string
  }>) => {
    const types = fetchTypesPackage(data.pkg, data.version)

    postMessage({
      id: data.id,
      types
    })
  }
)
