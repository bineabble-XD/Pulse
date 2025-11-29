import React, { useState } from "react";
import logoBg from "../assets/LogoBg.png";
import bgTexture from "../assets/3.png";

import { useDispatch } from "react-redux";
import { logout } from "../features/PulseSlice";
import { useNavigate } from "react-router-dom";

const INITIAL_NOTES = [
  {
    id: 1,
    user: "User",
    text: "Today was one of those days that just felt right. Got things done, had some good conversations, and ended the day feeling calm.",
    mediaUrl: null,
    mediaType: null,
  },
  {
    id: 2,
    user: "unknown",
    text: "Went to the park today and just walked without looking at my phone. Highly recommended.",
    mediaUrl: null,
    mediaType: null,
  },
];

const Home = () => {
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [newNote, setNewNote] = useState("");
  const [file, setFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0); // to reset file input

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ WORKING LOGOUT
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = newNote.trim();

    // Require at least text OR media
    if (!trimmed && !file) return;

    let mediaUrl = null;
    let mediaType = null;

    if (file) {
      mediaUrl = URL.createObjectURL(file);
      mediaType = file.type.startsWith("video") ? "video" : "image";
    }

    const nextNote = {
      id: Date.now(),
      user: "User", // placeholder for current user
      text: trimmed,
      mediaUrl,
      mediaType,
    };

    setNotes((prev) => [nextNote, ...prev]);
    setNewNote("");
    setFile(null);
    setFileInputKey((k) => k + 1); // clears file input
  };

  const handleFileChange = (e) => {
    const selected = e.target.files && e.target.files[0];
    setFile(selected || null);
  };

  return (
    <div
      className="home-page"
      style={{ backgroundImage: `url(${bgTexture})` }}
    >
      <div className="home-overlay" />

      <div className="home-inner">
        {/* Top nav bar */}
        <header className="home-header">
          <div className="home-logo-wrap">
            <img src={logoBg} alt="Pulse logo" className="home-logo" />
            <span className="home-logo-text">PULSE</span>
          </div>

          <nav className="home-nav">
            <button className="home-nav-link home-nav-link--active">
              HOME
            </button>
            <button className="home-nav-link">VIEW PROFILE</button>

            {/* ✅ WORKING LOGOUT BUTTON */}
            <button
              className="home-nav-link home-nav-link--danger"
              onClick={handleLogout}
            >
              LOG OUT
            </button>
          </nav>
        </header>

        {/* Main content */}
        <main className="home-content">
          {/* Compose card */}
          <section className="home-compose-wrapper">
            <form className="home-compose-card" onSubmit={handleSubmit}>
              <div className="home-compose-header">
                <div className="home-compose-avatar">👤</div>
                <span className="home-compose-username">@User</span>
              </div>

              <textarea
                className="home-compose-input"
                placeholder="Share a note, picture, or video with everyone..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />

              <div className="home-compose-footer">
                <div className="home-compose-left">
                  <label className="home-file-label">
                    <span className="home-file-label-text">
                      Attach image / video
                    </span>
                    <input
                      key={fileInputKey}
                      type="file"
                      accept="image/*,video/*"
                      className="home-file-input"
                      onChange={handleFileChange}
                    />
                  </label>
                  {file && (
                    <span className="home-file-name" title={file.name}>
                      {file.name}
                    </span>
                  )}
                </div>

                <button type="submit" className="home-compose-btn">
                  POST NOTE
                </button>
              </div>
            </form>
          </section>

          {/* Notes feed */}
          <section className="home-feed">
            {notes.map((note) => (
              <article key={note.id} className="home-note-card">
                <header className="home-note-header">
                  <div className="home-note-avatar">👤</div>
                  <span className="home-note-username">@{note.user}</span>
                </header>

                {note.mediaUrl && (
                  <div className="home-note-media">
                    {note.mediaType === "video" ? (
                      <video
                        src={note.mediaUrl}
                        controls
                        className="home-note-video"
                      />
                    ) : (
                      <img
                        src={note.mediaUrl}
                        alt="User upload"
                        className="home-note-image"
                      />
                    )}
                  </div>
                )}

                {note.text && (
                  <p className="home-note-text">{note.text}</p>
                )}

                <footer className="home-note-footer">
                  <button
                    type="button"
                    className="home-note-icon-btn"
                    aria-label="Like"
                  >
                    👍
                  </button>
                  <button
                    type="button"
                    className="home-note-icon-btn"
                    aria-label="Comment"
                  >
                    💬
                  </button>
                </footer>
              </article>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
};

export default Home;
