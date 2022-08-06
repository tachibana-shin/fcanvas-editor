const r =
  /((?:(?:\s|})(?:from\s*(?!`)))|(?:import(?:\s*)\(\s*))('|"|`)([^\2]+?)(\2)/gim

export async function resolveImport(
  code: string,
  fn: (v: string) => Promise<string>
) {
  const promises: Promise<string>[] = []

  code.replace(r, (_, $1, $2, $3, $4) => {
    promises.push(fn($3).then((re) => `${$1}${$2}${re}${$4}`))

    return _
  })

  const results = await Promise.all(promises)
  // eslint-disable-next-line functional/no-let
  let index = 0

  return code.replace(r, () => results[index++])
}
