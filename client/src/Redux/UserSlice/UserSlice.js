import { createSlice } from "@reduxjs/toolkit";

// Check if a user token exists in localStorage
const savedUser = localStorage.getItem("token") ? { token: localStorage.getItem("token") } : null;

const initialState = {
  currentUser: savedUser,
  error: null,
  loading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    signInSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    },
    signInError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.currentUser = null;
      state.error = null;
      localStorage.removeItem("token"); // clear token
    },
  },
});

export const { signInStart, signInSuccess, signInError, logout } = userSlice.actions;
export default userSlice.reducer;
