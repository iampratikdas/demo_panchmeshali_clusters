import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { UserContentState } from '../lib/type'
// import { constentResponse } from "../lib/data"
const initialState: UserContentState =
{
  data:
  {
    user_id: "",
    role: "",
    email: "",
    user_name: "",
    token: "",
    device_id: "",
  },
  isLoading: true,
}
// interface ID {
//   id: ""
// }

export const fetchUserContents = createAsyncThunk(
  'user_contents/fetchUserContents',
  async () => {
    let contents = {
      data:{
        user_id:"2",
        role:"Admin",
        email:"Pratikdas967@gmail.com",
        user_name:"Pratik Das",
        token:"5565656dhjshjhfsjhjkhjkds",
        device_id:"fdssd43433343fddfdfsd",
      }
    }
    console.log("contents==============>", contents)
    return contents;
  }
);



export const contentuserSlicer = createSlice({
  name: 'user_contents',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchUserContents
      .addCase(fetchUserContents.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserContents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload.data || {
          user_id: "",
          role: "",
          email: "",
          user_name: "",
          token: "",
          device_id: "",
        }
      })
      .addCase(fetchUserContents.rejected, (state, action) => {
        state.isLoading = false;
        console.error('Error fetching data:', action.error);
      })


  },
});



export default contentuserSlicer.reducer