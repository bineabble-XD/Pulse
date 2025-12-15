import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = "https://pulse-1-rke8.onrender.com";


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

      return res.data; 
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

      return res.data; 
    } catch (err) {
      console.error(err);
      return rejectWithValue(
        err.response?.data || { message: "Follow failed" }
      );
    }
  }
);

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

      return res.data; 
    } catch (err) {
      console.error(err);
      return rejectWithValue(
        err.response?.data || { message: "Unfollow failed" }
      );
    }
  }
);


const initialState = {
  user: null,
  token: null,
  message: "",
  isLoading: false,
  isSuccess: false,
  isError: false,
  isHydrated: false,
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
    setCredentials: (state, action) => {
      state.user = action.payload.user || null;
      state.token = action.payload.token || null;

      if (state.token) {
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${state.token}`;
      } else {
        delete axios.defaults.headers.common["Authorization"];
      }
    },
    setHydrated: (state) => {
      state.isHydrated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
      state.isHydrated = true;

      localStorage.removeItem("pulseUser");
      localStorage.removeItem("pulseToken");
      delete axios.defaults.headers.common["Authorization"];
    },
  },
  extraReducers: (builder) => {
    builder
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
        state.isHydrated = true;

        const { user, token, message } = action.payload || {};
        state.message = message || "Login successful";
        state.user = user || null;
        state.token = token || null;

        if (state.user && state.token) {
          localStorage.setItem("pulseUser", JSON.stringify(state.user));
          localStorage.setItem("pulseToken", state.token);
          axios.defaults.headers.common["Authorization"] =
            `Bearer ${state.token}`;
        } else {
          localStorage.removeItem("pulseUser");
          localStorage.removeItem("pulseToken");
          delete axios.defaults.headers.common["Authorization"];
        }
      })
      .addCase(getUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.isHydrated = true;
        state.message =
          action.payload?.message ||
          "Login failed, please check your email or password";
        state.user = null;
        state.token = null;

        localStorage.removeItem("pulseUser");
        localStorage.removeItem("pulseToken");
        delete axios.defaults.headers.common["Authorization"];
      })

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

export const { resetStatus, logout, setCredentials, setHydrated } =
  PulseSlice.actions;
export default PulseSlice.reducer;

export const loadUserFromStorage = () => (dispatch) => {
  try {
    const raw = localStorage.getItem("pulseUser");
    const token = localStorage.getItem("pulseToken");

    if (raw && token) {
      const user = JSON.parse(raw);

      axios.defaults.headers.common["Authorization"] =
        `Bearer ${token}`;

      dispatch(
        setCredentials({
          user,
          token,
        })
      );
    }
  } catch (err) {
    console.error("Error loading user from storage:", err);
  } finally {
    dispatch(setHydrated());
  }
};
