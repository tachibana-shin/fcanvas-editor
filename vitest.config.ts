import { resolve } from "path"

import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "src": resolve("./src")
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.spec.ts"],
    deps: {
      inline: true
    }
  }
})
