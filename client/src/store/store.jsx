// src/app/store.jsx
import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "../features/PulseSlice";

const store = configureStore({
  reducer: {
    users: usersReducer,
  },
});

export default store;
