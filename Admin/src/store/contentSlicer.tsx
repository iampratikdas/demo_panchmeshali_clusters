import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { SingleContentState } from '../lib/type'
import { constentResponse } from "../lib/data"
const initialState: SingleContentState =
{
  data:
  {
    id: "",
    type: "",
    parentId: "",
    contents: {},
  },
  isLoading: true,
}
interface ID {
  id: ""
}

export const fetchContents = createAsyncThunk(
  'contents/fetchContents',
  async (id: ID) => {
    let contents = constentResponse.find(item => item.id === id.id);
    // console.log("contents==============>", contents)
    return contents;
  }
);



export const contentSlicer = createSlice({
  name: 'contents',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchContents
      .addCase(fetchContents.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchContents.fulfilled, (state, action) => {
        state.isLoading = false;
        // console.log("action.payload==============>", action.payload , state.data)
        state.data = action.payload ? action.payload : state.data;
      
      })
      .addCase(fetchContents.rejected, (state, action) => {
        state.isLoading = false;
        console.error('Error fetching data:', action.error);
      })


  },
});



export default contentSlicer.reducer