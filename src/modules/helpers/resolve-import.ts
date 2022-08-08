const r =
  /((?:(?:\s|})(?:from\s*(?!`)))|(?:import(?:\s*)\(?\s*))('|"|`)([^\2]+?)(\2)/gim

export function resolveImport(
  code: string,
  fn: (v: string, type: string, scap: string) => string
) {
  return code.replace(r, (_, $1, $2, $3, $4) => {
    return `${$1}${$2}${fn($3, $1, $2)}${$4}`
  })
}
