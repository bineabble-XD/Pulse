import React from "react";
import { useNavigate } from "react-router-dom";
import logoBg from "../assets/LogoBg.png";      // SAME as Home.jsx
import bgTexture from "../assets/1.png";        // BACKGROUND = 1.png

const ResetPassword = () => {

  const navigate = useNavigate();

const goToLogin = () => {
  navigate("/login");
};

  return (
    <div
      className="reset-page"
      style={{ backgroundImage: `url(${bgTexture})` }}
    >
      <div className="reset-overlay" />

      <div className="reset-inner">
        {/* Top Navigation */}
        <header className="reset-header">
          <div className="reset-logo-wrap">
            <img src={logoBg} alt="Pulse logo" className="reset-logo" />
            <span className="reset-brand">PULSE</span>
          </div>

          <button className="reset-login-link" onClick={goToLogin}>LOG IN</button>
        </header>

        {/* Center Card */}
        <main className="reset-main">
          <section className="reset-card">
            <h1 className="reset-title">RESET PASSWORD</h1>

            <form className="reset-form">
              {/* Email */}
              <label className="reset-field">
                <span className="reset-label">EMAIL</span>
                <input
                  type="email"
                  className="reset-input"
                  placeholder="Enter your email"
                />
              </label>

              {/* New Password */}
              <label className="reset-field">
                <span className="reset-label">NEW PASSWORD</span>
                <input
                  type="password"
                  className="reset-input"
                  placeholder="Enter new password"
                />
              </label>

              {/* Confirm Password */}
              <label className="reset-field">
                <span className="reset-label">CONFIRM PASSWORD</span>
                <input
                  type="password"
                  className="reset-input"
                  placeholder="Re-enter new password"
                />
              </label>

              <button type="submit" className="reset-btn">
                RESET
              </button>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ResetPassword;
