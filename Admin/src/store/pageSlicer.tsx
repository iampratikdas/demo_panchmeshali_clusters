import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface PageState {
    value: string
  }
  const initialState: PageState = {
    value: "",
  }
  export const pageSlice = createSlice({
    name: 'pages',
    initialState,
    reducers: {
      pageName:(state, action: PayloadAction<string>) => {
        state.value = action.payload
      },
    },
  })
  
  // Action creators are generated for each case reducer function
  export const { pageName } = pageSlice.actions
  
  export default pageSlice.reducer