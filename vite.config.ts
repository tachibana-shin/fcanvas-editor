/* eslint-disable n/no-unpublished-import */
import preact from "@preact/preset-vite"
import AutoImport from "unplugin-auto-import/vite"
import IconsResolver from "unplugin-icons/resolver"
import Icons from "unplugin-icons/vite"
import { defineConfig } from "vite"
import WindiCSS from "vite-plugin-windicss"

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      path: "path-browserify"
    }
  },
  plugins: [
    preact(),
    WindiCSS(),
    /* ... */
    AutoImport({
      resolvers: [
        IconsResolver({
          prefix: "Icon",
          extension: "jsx"
        })
      ]
    }),
    Icons({
      autoInstall: true,
      compiler: "jsx"
    })
  ]
})
