import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  emailForVerification: string | null;
  accessToken: string | null;
}

const initialState: AuthState = {
  emailForVerification: null,
  // Pull token from localStorage initially so refreshing doesn't log them out
  accessToken: localStorage.getItem("accessToken"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setEmailForVerification: (state, action: PayloadAction<string>) => {
      state.emailForVerification = action.payload;
    },
    setCredentials: (state, action: PayloadAction<{ accessToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      // Persist to localStorage
      localStorage.setItem("accessToken", action.payload.accessToken);
    },
    logout: (state) => {
      state.accessToken = null;
      state.emailForVerification = null;
      // Clear localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
  },
});

export const { setEmailForVerification, setCredentials, logout } =
  authSlice.actions;
export default authSlice.reducer;
