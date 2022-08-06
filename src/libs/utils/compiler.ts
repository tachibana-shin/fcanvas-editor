import esbuildWASM from "esbuild-wasm"
import esbuildDotWASM from "esbuild-wasm/esbuild.wasm?url"
import { extname } from "path-browserify"

import { resolveImport } from "./helpers/resolve-import"
import { resolvePath } from "./helpers/resolve-path"

esbuildWASM.initialize({
  wasmURL: esbuildDotWASM
})
export async function compiler(
  content: string,
  filepath: string
): Promise<string> {
  console.log("compiler: start build %s", filepath)
  content = resolveImport(content, (path) => resolvePath(filepath, path))

  switch (extname(filepath)) {
    case ".ts":
      return (
        await esbuildWASM.transform(content, {
          loader: "ts"
        })
      ).code
  }

  return content
}
