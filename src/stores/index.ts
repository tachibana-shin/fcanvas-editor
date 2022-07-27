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

type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : Readonly<T[P]>
}

export const useStoreState = () =>
  useSelector((state) => state) as DeepReadonly<RootState>
