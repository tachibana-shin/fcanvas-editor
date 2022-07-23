import { configureStore } from "@reduxjs/toolkit"
import { useSelector } from "react-redux"

import { authReducer } from "./auth"
import { editorReducer } from "./editor"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    editor: editorReducer
  }
})

export type RootState = ReturnType<typeof store.getState>

export const useStoreState = () => useSelector((state) => state) as RootState
