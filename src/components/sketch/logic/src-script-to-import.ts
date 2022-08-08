import { join } from "path-browserify"

const rScript = /<script([^>]*?)src=(?:"|')([^"']+)(?:"|')([^>]*?)>/gim

export function srcScriptToImport(html: string) {
  const depends: string[] = []
  const code = html.replace(rScript, (_, $1, $2, $3) => {
    $2 = join("/", $2)
    depends.push($2)
    return `<script${$1}${$3}>import "~${$2}"`
  })

  return {
    code,
    depends
  }
}
