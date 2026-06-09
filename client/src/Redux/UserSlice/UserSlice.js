import { createSlice } from "@reduxjs/toolkit";

const getSavedAuthUser = () => {
  try {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    const userString =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    const user = userString ? JSON.parse(userString) : null;

    if (!token) return null;

    return {
      token,
      user,
    };
  } catch {
    return null;
  }
};

const initialState = {
  currentUser: getSavedAuthUser(),
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
      state.loading = false;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    },
  },
});

export const { signInStart, signInSuccess, signInError, logout } =
  userSlice.actions;

export default userSlice.reducer;