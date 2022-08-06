export function resolveImport(code: string, fn: (v: string) => string) {
  return code.replace(
    /((?:(?:\s|})(?:from\s*(?!`)))|(?:import(?:\s*)\(\s*))('|"|`)([^\2]+?)(\2)/gim,
    (_, $1, $2, $3, $4) => `${$1}${$2}${fn($3)}${$4}`
  )
}
