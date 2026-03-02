import { createSlice , createAsyncThunk} from '@reduxjs/toolkit';
import { ContentState } from '../lib/type'
import {constentResponse} from "../lib/data"
  const initialState: ContentState =
  {
    data:  [
        {  
            id: "",
            type: "",
            parentId: "",
            contents:{},
        }],
    isLoading: true,
  }
 
 
  
  // Thunk to fetch specific trailer by ID
  export const fetchContentsTrailerOne = createAsyncThunk(
    'contents_trailers_one/fetchContentsTrailerOne', // ✅ unique action type
    async (id: string) => {
      return constentResponse.filter(item => item.parentId === null && item.id === id);
    }
  );
  
  export const contentSlicer = createSlice({
    name: 'contents_trailers_one',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      builder
        // fetchContentsTrailerOne
        .addCase(fetchContentsTrailerOne.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(fetchContentsTrailerOne.fulfilled, (state, action) => {
          state.isLoading = false;
          state.data = action.payload;
        })
        .addCase(fetchContentsTrailerOne.rejected, (state, action) => {
          state.isLoading = false;
          console.error('Error fetching trailer by ID:', action.error);
        });
    },
  });
  

  
  export default contentSlicer.reducer