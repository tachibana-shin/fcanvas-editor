/// <reference types="vitest" />
/// <reference types="vite/client" />

import { fileURLToPath, URL } from "url"

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
        NODE_ENV: process.env.NODE_ENV,
        GITPOD_WORKSPACE_ID: process.env.GITPOD_WORKSPACE_ID,
        GITPOD_WORKSPACE_CLUSTER_HOST: process.env.GITPOD_WORKSPACE_CLUSTER_HOST
      }
    }
  },
  resolve: {
    alias: {
      path: "path-browserify",
      "~": fileURLToPath(new URL("./src", import.meta.url)),
      components: fileURLToPath(new URL("./src/components", import.meta.url))
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
  ],
  test: {
    globals: true,
    environment: "jsdom"
  }
})
