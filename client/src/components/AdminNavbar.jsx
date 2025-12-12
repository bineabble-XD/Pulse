import React from "react";
import logoBg from "../assets/LogoBg.png";
import { useDispatch } from "react-redux";
import { logout } from "../features/PulseSlice";
import { useNavigate, useLocation } from "react-router-dom";

const AdminNavbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="home-header">
      <div className="home-logo-wrap">
        <img src={logoBg} alt="Pulse logo" className="home-logo" />
        <span className="home-logo-text">PULSE</span>
      </div>

      <nav className="home-nav">
        <button
          className={`home-nav-link ${
            isActive("/admin") ? "home-nav-link--active" : ""
          }`}
          onClick={() => navigate("/admin")}
        >
          ADMIN PANEL
        </button>

        <button
          className="home-nav-link home-nav-link--danger"
          onClick={handleLogout}
        >
          LOG OUT
        </button>
      </nav>
    </header>
  );
};

export default AdminNavbar;
