import { createSlice } from "@reduxjs/toolkit";

const getSavedAuthUser = () => {
  try {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    const userString =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    const user = userString ? JSON.parse(userString) : null;

    if (!token || !user) return null;

    return {
      token,
      user,
    };
  } catch {
    return null;
  }
};

const saveAuthUser = ({ token, user, rememberMe = true }) => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");

  const storage = rememberMe ? localStorage : sessionStorage;

  storage.setItem("token", token);
  storage.setItem("user", JSON.stringify(user));
};

const clearAuthUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
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
      const { token, user, rememberMe = true } = action.payload;

      const authUser = {
        token,
        user,
      };

      state.currentUser = authUser;
      state.loading = false;
      state.error = null;

      saveAuthUser({
        token,
        user,
        rememberMe,
      });
    },

    signInError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    logout: (state) => {
      state.currentUser = null;
      state.error = null;
      state.loading = false;

      clearAuthUser();
    },
  },
});

export const { signInStart, signInSuccess, signInError, logout } =
  userSlice.actions;

export default userSlice.reducer;