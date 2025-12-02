// src/features/PulseSlice.jsx
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

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

// UPDATE PROFILE PIC
export const updateProfilePic = createAsyncThunk(
  "users/updateProfilePic",
  async (file, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const currentUser = state.users.user;

      if (!currentUser?._id) {
        throw new Error("No logged-in user");
      }

      const formData = new FormData();
      formData.append("image", file);

      const res = await axios.post(
        `${API_BASE}/users/${currentUser._id}/profile-pic`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return res.data; // { message, user }
    } catch (err) {
      console.error(err);
      return rejectWithValue(
        err.response?.data || {
          message: "Profile picture update failed",
        }
      );
    }
  }
);

// FOLLOW USER
export const followUser = createAsyncThunk(
  "users/followUser",
  async (targetId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const currentUser = state.users.user;

      if (!currentUser?._id) {
        throw new Error("No logged-in user");
      }

      const res = await axios.post(
        `${API_BASE}/users/${currentUser._id}/follow`,
        { targetId }
      );

      return res.data; // { message, user }
    } catch (err) {
      console.error(err);
      return rejectWithValue(
        err.response?.data || { message: "Follow failed" }
      );
    }
  }
);

// UNFOLLOW USER
export const unfollowUser = createAsyncThunk(
  "users/unfollowUser",
  async (targetId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const currentUser = state.users.user;

      if (!currentUser?._id) {
        throw new Error("No logged-in user");
      }

      const res = await axios.post(
        `${API_BASE}/users/${currentUser._id}/unfollow`,
        { targetId }
      );

      return res.data; // { message, user }
    } catch (err) {
      console.error(err);
      return rejectWithValue(
        err.response?.data || { message: "Unfollow failed" }
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
  isHydrated: false, // 👈 NEW
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
      state.isHydrated = true; // we now know there is NO user
      localStorage.removeItem("pulseUser");
    },
    loadUserFromStorage: (state) => {
      const raw = localStorage.getItem("pulseUser");
      if (raw) {
        try {
          state.user = JSON.parse(raw);
        } catch {
          state.user = null;
        }
      }
      state.isHydrated = true; // 👈 mark that we've checked storage
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
        state.isHydrated = true; // 👈 we now know the user
        state.message =
          action.payload?.message || "Login successful";
        state.user = action.payload?.user || null;
        if (state.user) {
          localStorage.setItem("pulseUser", JSON.stringify(state.user));
        }
      })
      .addCase(getUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.isHydrated = true; // 👈 also hydrated (but no user)
        state.message =
          action.payload?.message ||
          "Login failed, please check your email or password";
        state.user = null;
        localStorage.removeItem("pulseUser");
      })

      // UPDATE PROFILE PIC
      .addCase(updateProfilePic.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(updateProfilePic.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.message =
          action.payload?.message || "Profile picture updated";
        state.user = action.payload?.user || state.user;
        if (state.user) {
          localStorage.setItem("pulseUser", JSON.stringify(state.user));
        }
      })
      .addCase(updateProfilePic.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message =
          action.payload?.message || "Profile picture update failed";
      })

      // FOLLOW USER
      .addCase(followUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.message =
          action.payload?.message || "Followed user";
        state.user = action.payload?.user || state.user;
        if (state.user) {
          localStorage.setItem("pulseUser", JSON.stringify(state.user));
        }
      })
      .addCase(followUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message =
          action.payload?.message || "Follow failed";
      })

      // UNFOLLOW USER
      .addCase(unfollowUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.message =
          action.payload?.message || "Unfollowed user";
        state.user = action.payload?.user || state.user;
        if (state.user) {
          localStorage.setItem("pulseUser", JSON.stringify(state.user));
        }
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.message =
          action.payload?.message || "Unfollow failed";
      });
  },
});

export const {
  resetStatus,
  logout,
  loadUserFromStorage,
} = PulseSlice.actions;
export default PulseSlice.reducer;
