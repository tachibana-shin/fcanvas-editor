import { configureStore } from "@reduxjs/toolkit"

import { editorStore } from "./editor"
import { userStore } from "./user"

export const store = configureStore({
  reducer: {
    editor: editorStore.reducer,
    user: userStore.reducer
  }
})
