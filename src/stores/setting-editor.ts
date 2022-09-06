import { defineStore } from "pinia"

export const useSettingEditorStore = defineStore("setting-editor", {
  state: () => ({
    textSize: 16,
    autoSave: true,
    wordWrap: false,
    showLineNumbers: true
  })
})
