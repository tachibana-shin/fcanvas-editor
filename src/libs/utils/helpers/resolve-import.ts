const r =
  /((?:(?:\s|})(?:from\s*(?!`)))|(?:import(?:\s*)\(\s*))('|"|`)([^\2]+?)(\2)/gim

export function resolveImport(code: string, fn: (v: string) => string) {
  return code.replace(r, (_, $1, $2, $3, $4) => `${$1}${$2}${fn($3)}${$4}`)
}
