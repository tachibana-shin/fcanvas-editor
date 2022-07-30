import monaco from "monaco-editor"
import type { Options } from "prettier"
import { v4 } from "uuid"

import PrettierWorker from "src/workers/prettier?worker"

const languages = [
  {
    vscodeLanguageIds: ["javascript", "javascriptreact", "mongo", "mongodb"],
    extensions: [],
    parsers: [
      "babel",
      "espree",
      "meriyah",
      "babel-flow",
      "babel-ts",
      "flow",
      "typescript"
    ]
  },
  {
    vscodeLanguageIds: ["typescript"],
    extensions: [],
    parsers: ["typescript", "babel-ts"]
  },
  {
    vscodeLanguageIds: ["typescriptreact"],
    extensions: [],
    parsers: ["typescript", "babel-ts"]
  },
  {
    vscodeLanguageIds: ["json"],
    extensions: [],
    parsers: ["json-stringify"]
  },
  {
    vscodeLanguageIds: ["json"],
    extensions: [],
    parsers: ["json"]
  },
  {
    vscodeLanguageIds: ["jsonc"],
    parsers: ["json"]
  },
  {
    vscodeLanguageIds: ["json5"],
    extensions: [],
    parsers: ["json5"]
  },
  {
    vscodeLanguageIds: ["handlebars"],
    extensions: [],
    parsers: ["glimmer"]
  },
  {
    vscodeLanguageIds: ["graphql"],
    extensions: [],
    parsers: ["graphql"]
  },
  {
    vscodeLanguageIds: ["markdown"],
    parsers: ["markdown"]
  },
  {
    vscodeLanguageIds: ["mdx"],
    extensions: [],
    parsers: ["mdx"]
  },
  {
    vscodeLanguageIds: ["html"],
    extensions: [],
    parsers: ["angular"]
  },
  {
    vscodeLanguageIds: ["html"],
    extensions: [],
    parsers: ["html"]
  },
  {
    vscodeLanguageIds: ["html"],
    extensions: [],
    parsers: ["lwc"]
  },
  {
    vscodeLanguageIds: ["vue"],
    extensions: [],
    parsers: ["vue"]
  },
  {
    vscodeLanguageIds: ["yaml", "ansible", "home-assistant"],
    extensions: [],
    parsers: ["yaml"]
  }
]

const prettier = new PrettierWorker()
function format(code: string, parser: string, options: Options) {
  return new Promise<string>((resolve) => {
    const id = v4()
    const handler = (
      event: MessageEvent<{
        id: string
        code: string
        type: "success" | "failed"
        error?: unknown
      }>
    ) => {
      if (event.data.id === id) {
        resolve(event.data.code)
        prettier.removeEventListener("message", handler)
      }
    }
    prettier.addEventListener("message", handler)
    prettier.postMessage({
      id,
      code,
      parser,
      ...options
    })
  })
}

export async function installFormatter() {
  languages.forEach((language) => {
    language.vscodeLanguageIds.forEach((id) => {
      monaco.languages.registerDocumentFormattingEditProvider(id, {
        async provideDocumentFormattingEdits(model) {
          return [
            {
              range: model.getFullModelRange(),
              text: await format(model.getValue(), language.parsers[0], {})
            }
          ]
        }
      })
    })
  })
}
