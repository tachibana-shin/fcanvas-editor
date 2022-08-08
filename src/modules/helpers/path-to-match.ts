const r = /\$\{([^}]+?)\}/gim

export function pathToMatch(path: string) {
  return path.replace(r, "*")
}
