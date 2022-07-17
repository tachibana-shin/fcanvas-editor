import { createSlice } from "@reduxjs/toolkit"

export const editor = createSlice({
  name: "editor",
  initialState: {
    currentFileEdit: <null | string>null
  },
  reducers: {
    setCurrentFileEdit(state, action) {
      // eslint-disable-next-line functional/immutable-data
      state.currentFileEdit = action.payload
    }
  }
})
