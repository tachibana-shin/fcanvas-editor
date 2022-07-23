import type { User } from "@firebase/auth"
import type { PayloadAction } from "@reduxjs/toolkit"
import { createSlice } from "@reduxjs/toolkit"

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: <
      Pick<
        User,
        | "photoURL"
        | "email"
        | "displayName"
        | "isAnonymous"
        | "providerId"
      > | null
    >null
  },
  reducers: {
    setUser(
      state,
      action: PayloadAction<Pick<
        User,
        | "photoURL"
        | "email"
        | "displayName"
        | "isAnonymous"
        | "providerId"
        | "tenantId"
      > | null>
    ) {
      // eslint-disable-next-line functional/immutable-data
      state.user = action.payload
    }
  }
})

export const authReducer = authSlice.reducer
