import type { PayloadAction } from "@reduxjs/toolkit"
import { createSlice } from "@reduxjs/toolkit"

const editorSlice = createSlice({
  name: "editor",
  initialState: {
    currentSelect: <string | null>null,
    currentFile: <string | null>null,

    sketchName: <string | null>null
  },
  reducers: {
    setCurrentSelect(state, { payload }: PayloadAction<string>) {
      // eslint-disable-next-line functional/immutable-data
      state.currentSelect = payload
    },
    setCurrentFile(state, { payload }: PayloadAction<string>) {
      // eslint-disable-next-line functional/immutable-data
      state.currentFile = payload
    },
    setSketchName(state, { payload }: PayloadAction<string>) {
      // eslint-disable-next-line functional/immutable-data
      state.sketchName = payload
    }
  }
})

export const editorReducer = editorSlice.reducer
