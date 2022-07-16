// eslint-disable-next-line n/no-unpublished-import
import { defineConfig } from "windicss/helpers"
// eslint-disable-next-line n/no-unpublished-import
import formsPlugin from "windicss/plugin/forms"

export default defineConfig({
  darkMode: "class",
  safelist: "p-3 p-4 p-5",
  theme: {
    extend: {
      colors: {
        teal: {
          100: "#096"
        }
      }
    }
  },
  attributify: {
    prefix: "w:"
  },
  plugins: [formsPlugin]
})
