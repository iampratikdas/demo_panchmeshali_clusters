// src/redux/slices/profileSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProfileState {
  full_name: string;
  email: string;
  uid: string;
}

const initialState: ProfileState = {
  full_name: "",
  email: "",
  uid: "",
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<ProfileState>) => {
      return action.payload; // replace state with new profile
    },
    clearProfile: () => initialState,
  },
});

export const { setProfile, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
