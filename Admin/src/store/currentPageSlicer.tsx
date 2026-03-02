import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentPageStatus: 1,
  reset: false,
  active_Tab: "event_story"
};

const currentPageSlicer = createSlice({
  name: 'currentPageStatus',
  initialState,
  reducers: {
    setCurrentPageStatus: (state, action) => {
      state.currentPageStatus = action.payload;
    },
     setCurrentTab: (state, action) => {
      state.active_Tab = action.payload;
    },
    resetPage: (state) => {
      state.currentPageStatus = 1;
      state.reset = true;
    },
    clearReset: (state) => {
      state.reset = false;
    },
  },
});

export const { setCurrentPageStatus, resetPage, clearReset , setCurrentTab} = currentPageSlicer.actions;

export default currentPageSlicer.reducer;
