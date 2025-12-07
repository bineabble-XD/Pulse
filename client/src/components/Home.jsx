// src/components/Home.jsx
import React, { useState, useEffect } from "react";
import bgTexture from "../assets/3.png";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// 🔹 icons
import { FcLike } from "react-icons/fc";
import { FaRegCommentDots } from "react-icons/fa";
import { MdModeEdit, MdDeleteOutline } from "react-icons/md";

const API_BASE = "http://localhost:6969";

// 🔹 helper to format createdAt
const formatDateTime = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const monthShort = d.toLocaleString("en", { month: "short" }); // Dec, Jan, etc.
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");

  return `${day} ${monthShort} · ${hours}:${mins}`;
};

const Home = () => {
  const { user } = useSelector((state) => state.users);
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [newNote, setNewNote] = useState("");

  // 💬 location text (what you already had)
  const [location, setLocation] = useState("");

  // 📍 NEW: numeric coordinates
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);

  const [file, setFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});

  const [imageModal, setImageModal] = useState({
    open: false,
    url: "",
  });

  // 🔹 edit state
  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState("");

  // DELETE post – no authorId in body, backend uses token
  const handleDeletePost = async (postId) => {
    if (!user?._id) return;

    const confirmDelete = window.confirm("Delete this post?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE}/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error("Delete post error:", err);
      alert("Error deleting post");
    }
  };

  // LIKE / UNLIKE – no userId in body
  const handleToggleLike = async (postId) => {
    if (!user?._id) return;

    try {
      const res = await axios.post(`${API_BASE}/posts/${postId}/like`, {});
      const updated = res.data.post;
      setPosts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );
    } catch (err) {
      console.error("Like toggle error:", err);
      alert("Error toggling like");
    }
  };

  // COMMENT typing
  const handleCommentChange = (postId, value) => {
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: value,
    }));
  };

  // COMMENT submit – remove userId, backend uses JWT
  const handleAddComment = async (postId) => {
    if (!user?._id) return;

    const text = (commentInputs[postId] || "").trim();
    if (!text) return;

    try {
      const res = await axios.post(`${API_BASE}/posts/${postId}/comment`, {
        text,
      });

      const updated = res.data.post;

      setPosts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );

      setCommentInputs((prev) => ({
        ...prev,
        [postId]: "",
      }));
    } catch (err) {
      console.error("Add comment error:", err);
      alert("Error adding comment");
    }
  };

  // 🔹 start editing a post
  const startEditingPost = (post) => {
    if (!post || !post._id) return;
    setEditingPostId(post._id);
    setEditText(post.text || "");
  };

  // 🔹 cancel editing
  const cancelEditingPost = () => {
    setEditingPostId(null);
    setEditText("");
  };

  // 🔹 save edited post (text only)
  const handleSaveEdit = async (postId) => {
    if (!user?._id) return;

    const trimmed = (editText || "").trim();
    // if (!trimmed) return; // uncomment to block empty edits

    try {
      const res = await axios.put(`${API_BASE}/posts/${postId}`, {
        text: trimmed,
      });

      const updated = res.data.post;

      setPosts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );

      setEditingPostId(null);
      setEditText("");
    } catch (err) {
      console.error("Edit post error:", err);
      alert("Error updating post");
    }
  };

  // 🌍 NEW: detect current location and fill lat/lon + location text
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLon(longitude);
        // you can format this however you like
        setLocation(`${latitude}, ${longitude}`);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to retrieve your location.");
      }
    );
  };

  // load DISCOVER feed (public)
  useEffect(() => {
    const fetchDiscover = async () => {
      try {
        setLoadingFeed(true);
        const res = await axios.get(`${API_BASE}/posts/discover`);
        setPosts(res.data || []);
      } catch (err) {
        console.error("Discover feed error:", err);
      } finally {
        setLoadingFeed(false);
      }
    };

    fetchDiscover();
  }, []);

  // CREATE POST – send location + coordinates
  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = newNote.trim();

    if (!trimmed && !file) return;
    if (!user?._id) return;

    try {
      const formData = new FormData();
      formData.append("text", trimmed);
      formData.append("location", location || "");
      if (lat != null) formData.append("latitude", lat);
      if (lon != null) formData.append("longitude", lon);
      if (file) {
        formData.append("media", file);
      }

      const res = await axios.post(`${API_BASE}/posts`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const created = res.data.post;
      setPosts((prev) => [created, ...prev]);

      setNewNote("");
      setLocation("");
      setLat(null);
      setLon(null);
      setFile(null);
      setFileInputKey((k) => k + 1);
    } catch (err) {
      console.error("Create post error:", err);
      alert("Error creating post");
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files && e.target.files[0];
    setFile(selected || null);
  };

  const displayName = `@${user?.username || "user"}`;

  return (
    <div className="home-page" style={{ backgroundImage: `url(${bgTexture})` }}>
      <div className="home-inner">
        <Navbar />

        <main className="home-content">
          {/* Compose card */}
          <section className="home-compose-wrapper">
            <form className="home-compose-card" onSubmit={handleSubmit}>
              <div className="home-compose-header">
                <div className="home-note-avatar">
                  {user?.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt="avatar"
                      className="home-note-avatar-image"
                    />
                  ) : (
                    "👤"
                  )}
                </div>

                <span
                  className="home-compose-username"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("/profile")}
                >
                  {displayName}
                </span>
              </div>

              <textarea
                className="home-compose-input"
                placeholder="Share a note, picture, or video with everyone..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />

              {/* Location input (optional) */}
              <input
                type="text"
                className="home-compose-location"
                placeholder="Add location (optional)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />

              {/* 📍 Button to auto-detect GPS */}
              <button
                type="button"
                className="home-detect-location-btn"
                onClick={handleDetectLocation}
                style={{ marginTop: "6px" }}
              >
                Use My Current Location
              </button>

              {/* Optional Google Maps preview when coords are available */}
              {lat != null && lon != null && (
                <div style={{ marginTop: "10px", borderRadius: "12px", overflow: "hidden" }}>
                  <iframe
                    width="100%"
                    height="250"
                    src={`https://maps.google.com/maps?q=${lat},${lon}&output=embed`}
                    title="Selected location"
                    style={{ border: "0" }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              )}

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
                  POST
                </button>
              </div>
            </form>
          </section>

          {/* Feed (DISCOVER) */}
          <section className="home-feed">
            {loadingFeed ? (
              <p style={{ color: "white" }}>Loading feed...</p>
            ) : posts.length === 0 ? (
              <p style={{ color: "white" }}>
                No posts yet. Be the first to post!
              </p>
            ) : (
              posts.map((post) => {
                const likeCount = post.likes?.length || 0;
                const isLiked =
                  user &&
                  Array.isArray(post.likes) &&
                  post.likes.some((id) => id === user._id);

                const comments = post.comments || [];
                const commentValue = commentInputs[post._id] || "";

                const isAuthor =
                  user && post.author && post.author._id === user._id;

                const hasLocation =
                  post.location && post.location.trim() !== "";
                const createdLabel = formatDateTime(post.createdAt);
                const isEditing = editingPostId === post._id;

                return (
                  <article key={post._id} className="home-note-card">
                    <header className="home-note-header">
                      <div className="home-note-avatar">
                        {post.author?.profilePic ? (
                          <img
                            src={post.author.profilePic}
                            alt="avatar"
                            className="home-note-avatar-image"
                          />
                        ) : (
                          "👤"
                        )}
                      </div>

                      <div className="home-note-header-text">
                        <div className="home-note-header-top">
                          {/* username clickable to /u/:username */}
                          <span
                            className="home-note-username"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              if (post.author?.username) {
                                navigate(`/u/${post.author.username}`);
                              }
                            }}
                          >
                            @{post.author?.username || "user"}
                          </span>

                          {(hasLocation || createdLabel) && (
                            <span className="home-note-meta">
                              {hasLocation && (
                                <>
                                  <span className="home-note-meta-location">
                                    📍 {post.location}
                                  </span>
                                  {createdLabel && (
                                    <span className="home-note-meta-sep">•</span>
                                  )}
                                </>
                              )}
                              {createdLabel && (
                                <span className="home-note-meta-time">
                                  {createdLabel}
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </header>

                    {post.mediaUrl && (
                      <div className="home-note-media">
                        {post.mediaType === "video" ? (
                          <video
                            src={post.mediaUrl}
                            controls
                            className="home-note-video"
                          />
                        ) : (
                          <img
                            src={post.mediaUrl}
                            alt="User upload"
                            className="home-note-image"
                            onClick={() =>
                              setImageModal({
                                open: true,
                                url: post.mediaUrl,
                              })
                            }
                          />
                        )}
                      </div>
                    )}

                    {/* TEXT / EDIT MODE */}
                    {!isEditing && post.text && (
                      <p className="home-note-text">{post.text}</p>
                    )}

                    {isEditing && (
                      <div className="home-note-edit">
                        <textarea
                          className="home-note-edit-input"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                        />
                        <div className="home-note-edit-actions">
                          <button
                            type="button"
                            className="home-note-edit-save"
                            onClick={() => handleSaveEdit(post._id)}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="home-note-edit-cancel"
                            onClick={cancelEditingPost}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <footer className="home-note-footer">
                      {/* LIKE */}
                      <button
                        type="button"
                        className={`home-note-icon-btn ${
                          isLiked ? "home-note-icon-btn--active" : ""
                        }`}
                        aria-label="Like"
                        onClick={() => handleToggleLike(post._id)}
                      >
                        <FcLike size={18} />
                        {likeCount > 0 && (
                          <span className="home-note-icon-count">
                            {likeCount}
                          </span>
                        )}
                      </button>

                      {/* COMMENT */}
                      <button
                        type="button"
                        className="home-note-icon-btn"
                        aria-label="Comment"
                      >
                        <FaRegCommentDots size={16} />
                        {comments.length > 0 && (
                          <span className="home-note-icon-count">
                            {comments.length}
                          </span>
                        )}
                      </button>

                      {/* EDIT & DELETE – author only */}
                      {isAuthor && (
                        <>
                          <button
                            type="button"
                            className="home-note-icon-btn"
                            aria-label="Edit post"
                            onClick={() => startEditingPost(post)}
                          >
                            <MdModeEdit size={18} />
                          </button>

                          <button
                            type="button"
                            className="home-note-icon-btn home-note-icon-btn--danger"
                            aria-label="Delete post"
                            onClick={() => handleDeletePost(post._id)}
                          >
                            <MdDeleteOutline size={18} />
                          </button>
                        </>
                      )}
                    </footer>

                    {/* COMMENTS SECTION */}
                    <div className="home-post-comments">
                      {comments.length > 0 && (
                        <div className="home-post-comments-list">
                          {comments.map((c) => (
                            <div
                              key={c._id || c.createdAt}
                              className="home-post-comment"
                            >
                              <span className="home-post-comment-author">
                                @{c.author?.username || "user"}
                              </span>
                              <span className="home-post-comment-text">
                                {" "}
                                {c.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {user && (
                        <div className="home-post-comment-input-row">
                          <input
                            type="text"
                            className="home-post-comment-input"
                            placeholder="Add a comment..."
                            value={commentValue}
                            onChange={(e) =>
                              handleCommentChange(post._id, e.target.value)
                            }
                          />
                          <button
                            className="home-post-comment-send"
                            type="button"
                            onClick={() => handleAddComment(post._id)}
                          >
                            SEND
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </section>
        </main>
      </div>

      {/* fullscreen image modal */}
      {imageModal.open && (
        <div
          className="image-modal-backdrop"
          onClick={() => setImageModal({ open: false, url: "" })}
        >
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={imageModal.url} alt="Full" className="image-modal-img" />
            <button
              className="image-modal-close"
              type="button"
              onClick={() => setImageModal({ open: false, url: "" })}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
