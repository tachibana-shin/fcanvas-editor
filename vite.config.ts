/* eslint-disable n/no-unpublished-import */
import react from "@vitejs/plugin-react"
import AutoImport from "unplugin-auto-import/vite"
import IconsResolver from "unplugin-icons/resolver"
import Icons from "unplugin-icons/vite"
import { defineConfig } from "vite"
import WindiCSS from "vite-plugin-windicss"

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    process: {
      env: {
        NODE_ENV: process.env.NODE_ENV
      }
    }
  },
  resolve: {
    alias: {
      path: "path-browserify"
    }
  },
  plugins: [
    react(),
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
