import type { PayloadAction } from "@reduxjs/toolkit"
import { createSlice } from "@reduxjs/toolkit"
import { relative } from "path-browserify"

const editorSlice = createSlice({
  name: "editor",
  initialState: {
    currentSelect: <string | null>null,
    currentFile: <string | null>null
  },
  reducers: {
    setCurrentSelect(state, { payload }: PayloadAction<string>) {
      // eslint-disable-next-line functional/immutable-data
      state.currentSelect = relative("/", payload)
    },
    setCurrentFile(state, { payload }: PayloadAction<string>) {
      // eslint-disable-next-line functional/immutable-data
      state.currentFile = payload
    }
  }
})

export const editorReducer = editorSlice.reducer
