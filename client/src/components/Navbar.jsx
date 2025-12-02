import React from "react";
import logoBg from "../assets/LogoBg.png";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/PulseSlice";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useSelector((state) => state.users);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;
  const isAdmin = user?.role === "admin" || user?.isAdmin;

  return (
    <header className="home-header">
      <div className="home-logo-wrap">
        <img src={logoBg} alt="Pulse logo" className="home-logo" />
        <span className="home-logo-text">PULSE</span>
      </div>

      <nav className="home-nav">
        <button
          className={`home-nav-link ${
            isActive("/home") ? "home-nav-link--active" : ""
          }`}
          onClick={() => navigate("/home")}
        >
          HOME
        </button>

        {!isAdmin && (
          <button
            className={`home-nav-link ${
              isActive("/profile") ? "home-nav-link--active" : ""
            }`}
            onClick={() => navigate("/profile")}
          >
            VIEW PROFILE
          </button>
        )}

        {isAdmin && (
          <button
            className={`home-nav-link ${
              isActive("/admin") ? "home-nav-link--active" : ""
            }`}
            onClick={() => navigate("/admin")}
          >
            ADMIN PANEL
          </button>
        )}

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

export default Navbar;
