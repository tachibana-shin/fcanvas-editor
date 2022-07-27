import type { PayloadAction } from "@reduxjs/toolkit"
import { createSlice } from "@reduxjs/toolkit"

const editorSlice = createSlice({
  name: "editor",
  initialState: {
    currentSelect: <string | null>null,
    currentFile: <string | null>null,

    sketchId: <string | null>null,
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

    // super action
    setSketchName(state, { payload }: PayloadAction<string>) {
      // save the current
      // eslint-disable-next-line functional/immutable-data
      state.sketchName = payload
    },
    setSketchId(state, { payload }: PayloadAction<string | null>) {
      // eslint-disable-next-line functional/immutable-data
      state.sketchId = payload
    }
  }
})

export const editorReducer = editorSlice.reducer
