import { join } from "path-browserify"

const rScript = /<script([^>]*?)src=(?:"|')([^"']+)(?:"|')([^>]*?)>/gim

export function srcScriptToImport(html: string): string {
  return html.replace(
    rScript,
    (_, $1, $2, $3) => `<script${$1}${$3}>import "${join("~", $2)}"`
  )
}
