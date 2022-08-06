const rScript = /<script([^>]*?)src=(?:"|')([^"']+)(?:"|')([^>]*?)>/gim

export function srcScriptToImport(html: string): string {
  return html.replace(rScript, '<script$1$3>import "$2"')
}
