import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/PulsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export default store;
