import { configureStore } from "@reduxjs/toolkit"

import { editorStore } from "./editor"

export const store = configureStore({
  reducer: {
    editor: editorStore.reducer
  }
})
