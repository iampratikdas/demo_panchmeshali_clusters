import { createSlice , createAsyncThunk} from '@reduxjs/toolkit';
import { ContentState } from '../lib/type'
import {constentResponse} from "../lib/data"
  const initialState: ContentState =
  {
    data:  [
        {  
            id: "",
            type: "",
            parentId: " ",
            contents:{},
        }],
    isLoading: true,
  }
 

  
  // Thunk to fetch trailers (parentId === null)
  export const fetchContentsTrailers = createAsyncThunk(
    'contents/fetchContentsTrailers',
    async () => {
      let res = constentResponse.filter(item => item.parentId === null)
      return res;
    }
  );

  
  export const contentSlicer = createSlice({
    name: 'contents_trailers',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
      builder
        // fetchContentsTrailers
        .addCase(fetchContentsTrailers.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(fetchContentsTrailers.fulfilled, (state, action) => {
          state.isLoading = false;
          state.data = action.payload;
        })
        .addCase(fetchContentsTrailers.rejected, (state, action) => {
          state.isLoading = false;
          console.error('Error fetching trailers:', action.error);
        })
  
    },
  });
  

  
  export default contentSlicer.reducer