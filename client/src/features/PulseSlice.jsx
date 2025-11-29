// src/features/PulseSlice.jsx
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ⚠️ if your backend uses another port, change this:
const API_BASE = "http://localhost:6969";

// === THUNKS =======================================================

// REGISTER
export const addUser = createAsyncThunk(
  "users/addUser",
  async (udata, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_BASE}/register`, udata);
      return res.data;
    } catch (err) {
      console.error(err);
      return rejectWithValue(
        err.response?.data || { message: "Register failed" }
      );
    }
  }
);

// LOGIN
export const getUser = createAsyncThunk(
  "users/getUser",
  async (udata, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_BASE}/login`, udata);
      return res.data;
    } catch (err) {
      console.error(err);
      return rejectWithValue(
        err.response?.data || { message: "Login failed" }
      );
    }
  }
);

// === SLICE ========================================================

const initialState = {
  user: null,
  message: "",
  isLoading: false,
  isSuccess: false,
  isError: false,
};

const PulseSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
    logout: (state) => {
      state.user = null;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // REGISTER
      .addCase(addUser.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.message = "";
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message =
          action.payload?.message || "Registered successfully";
      })
      .addCase(addUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message =
          action.payload?.message ||
          "Register failed, please try again";
      })
      // LOGIN
      .addCase(getUser.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.message = "";
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message =
          action.payload?.message || "Login successful";
        state.user = action.payload?.user || null;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message =
          action.payload?.message ||
          "Login failed, please check your email or password";
        state.user = null;
      });
  },
});

export const { resetStatus, logout } = PulseSlice.actions;
export default PulseSlice.reducer;
