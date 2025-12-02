// src/components/RequireAuth.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const RequireAuth = ({ children }) => {
  const { user, isHydrated } = useSelector((state) => state.users);
  const location = useLocation();

  // 👇 Before we know if there's a user, don't redirect yet
  if (!isHydrated) {
    // you can return a loader/spinner here if you want
    return null;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;
