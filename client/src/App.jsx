import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import LandingPage from "./components/LandingPage.jsx";
import Login from "./components/Login.jsx";
import Registeration from "./components/Registeration.jsx";
import Home from "./components/Home.jsx";
import Profile from "./components/Profile.jsx";
import Admin from "./components/Admin.jsx";
import ResetPassword from "./components/ResetPassword.jsx";
import PublicProfile from "./components/PublicProfile.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import Following from "./components/Following.jsx";

import { loadUserFromStorage } from "./features/PulseSlice";

import "./App.css";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registeration />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/home"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />

        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />

        <Route
          path="/admin"
          element={
            <RequireAuth>
              <Admin />
            </RequireAuth>
          }
        />

        <Route
          path="/u/:username"
          element={
            <RequireAuth>
              <PublicProfile />
            </RequireAuth>
          }
        />

        <Route
          path="/following"
          element={
            <RequireAuth>
              <Following />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
