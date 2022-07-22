import { relative } from "path-browserify"
import { defineStore } from "react-mise"

export const useEditorStore = defineStore("editor", {
  state: () => ({
    currentSelect: <string | null>null,
    currentFile: <string | null>null
  }),
  actions: {
    isCurrentSelect(filepath: string) {
      return this.currentSelect === relative("/", filepath)
    },
    setCurrentSelect(filepath: string) {
      // eslint-disable-next-line functional/immutable-data
      this.currentSelect = relative("/", filepath)
    },

    setCurrentFile(filepath: string) {
      // eslint-disable-next-line functional/immutable-data
      this.currentFile = filepath
    }
  }
})
