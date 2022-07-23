import type { Options } from "prettier"
import prettier from "prettier"
import angularPlugin from "prettier/parser-angular"
import babelPlugin from "prettier/parser-babel"
import espreePlugin from "prettier/parser-espree"
import flowPlugin from "prettier/parser-flow"
import glimmerPlugin from "prettier/parser-glimmer"
import graphqlPlugin from "prettier/parser-graphql"
import htmlPlugin from "prettier/parser-html"
import markdownPlugin from "prettier/parser-markdown"
import meriyahPlugin from "prettier/parser-meriyah"
import postCSSPlugin from "prettier/parser-postcss"
import typescriptPlugin from "prettier/parser-typescript"
import yamlPlugin from "prettier/parser-yaml"

const plugins = [
  angularPlugin,
  babelPlugin,
  espreePlugin,
  flowPlugin,
  glimmerPlugin,
  graphqlPlugin,
  htmlPlugin,
  meriyahPlugin,
  postCSSPlugin,
  typescriptPlugin,
  yamlPlugin,
  markdownPlugin
]

interface MessageType {
  id: number
  code: string
  parser: string
  options: Options
}

addEventListener("message", ({ data }: MessageEvent<MessageType>) => {
  try {
    const codeFormatted = prettier.format(data.code, {
      parser: data.parser,
      plugins,
      singleQuote: false,
      semi: false,
      trailingComma: "none",
      ...data.options
    })

    postMessage({
      id: data.id,
      code: codeFormatted
    })
  } catch (error) {
    postMessage({
      id: data.id,
      error
    })
  }
})
