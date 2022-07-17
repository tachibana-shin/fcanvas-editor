import { configureStore } from "@reduxjs/toolkit"

import { editor } from "./editor"

export const store = configureStore({
  reducer: {
    editor: editor.reducer
  }
})
