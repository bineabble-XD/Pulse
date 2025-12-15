import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/LogoBg.png";

export default function LandingPage() {
  return (
    <div className="page landing-bg landing-page">

      <header className="top-bar">
        <div className="brand-left">
          <img src={logo} alt="Pulse logo" className="brand-logo" />
          <span className="brand-title">PULSE</span>
        </div>

        <Link to="/login" className="login-link">
          LOG IN
        </Link>
      </header>

      <main className="hero-section">
        <h1 className="hero-text">
          PULSE HELPS YOU
          <br />
          CONNECT WITH YOUR
          <br />
          LOVED ONES WITH A
          <br />
          PRESS OF A BUTTON
        </h1>

        <Link to="/register" className="hero-button-link">
          <button className="hero-button">JOIN TODAY!</button>
        </Link>

      </main>

    </div>
  );
}
