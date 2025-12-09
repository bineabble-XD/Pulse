// src/components/ResetPassword.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import logoBg from "../assets/LogoBg.png";
import bgTexture from "../assets/1.png";

const API_BASE = "https://pulse-nahr.onrender.com";

const ResetPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const goToLogin = () => {
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    if (!email || !password || !confirm) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_BASE}/reset-password`, {
        email,
        newPassword: password,
      });

      setMsg(res.data.message || "Password reset successfully.");
      // optional: go back to login after a short delay
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("Reset error:", err);
      const msgFromServer =
        err.response?.data?.message || "Failed to reset password.";
      setError(msgFromServer);
    } finally {
      setLoading(false);
    }
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

          <button className="reset-login-link" onClick={goToLogin}>
            LOG IN
          </button>
        </header>

        {/* Center Card */}
        <main className="reset-main">
          <section className="reset-card">
            <h1 className="reset-title">RESET PASSWORD</h1>

            <form className="reset-form" onSubmit={handleSubmit}>
              <label className="reset-field">
                <span className="reset-label">EMAIL</span>
                <input
                  type="email"
                  className="reset-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <label className="reset-field">
                <span className="reset-label">NEW PASSWORD</span>
                <input
                  type="password"
                  className="reset-input"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>

              <label className="reset-field">
                <span className="reset-label">CONFIRM PASSWORD</span>
                <input
                  type="password"
                  className="reset-input"
                  placeholder="Re-enter new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </label>

              {error && (
                <p style={{ color: "#ff7070", fontSize: 12, marginTop: 4 }}>
                  {error}
                </p>
              )}
              {msg && (
                <p style={{ color: "#4dff88", fontSize: 12, marginTop: 4 }}>
                  {msg}
                </p>
              )}

              <button type="submit" className="reset-btn" disabled={loading}>
                {loading ? "WORKING..." : "RESET"}
              </button>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ResetPassword;
