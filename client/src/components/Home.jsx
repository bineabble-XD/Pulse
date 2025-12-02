// src/components/Home.jsx
import React, { useState, useEffect } from "react";
import bgTexture from "../assets/3.png";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:6969";

const Home = () => {
  // get current logged-in user from Redux
  const { user } = useSelector((state) => state.users);
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [file, setFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0); // to reset file input
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});

  const handleDeletePost = async (postId) => {
    if (!user?._id) return;

    const confirmDelete = window.confirm("Delete this post?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE}/posts/${postId}`, {
        data: { authorId: user._id },
      });

      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error("Delete post error:", err);
      alert("Error deleting post");
    }
  };

  // 🔥 LIKE / UNLIKE
  const handleToggleLike = async (postId) => {
    if (!user?._id) return;

    try {
      const res = await axios.post(`${API_BASE}/posts/${postId}/like`, {
        userId: user._id,
      });

      const updated = res.data.post;
      setPosts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );
    } catch (err) {
      console.error("Like toggle error:", err);
      alert("Error toggling like");
    }
  };

  // 💬 handle typing in a comment input
  const handleCommentChange = (postId, value) => {
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: value,
    }));
  };

  // 💬 submit comment
  const handleAddComment = async (postId) => {
    if (!user?._id) return;

    const text = (commentInputs[postId] || "").trim();
    if (!text) return;

    try {
      const res = await axios.post(
        `${API_BASE}/posts/${postId}/comment`,
        {
          userId: user._id,
          text,
        }
      );

      const updated = res.data.post;

      // replace the post in state with the updated one
      setPosts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );

      // clear comment box for that post
      setCommentInputs((prev) => ({
        ...prev,
        [postId]: "",
      }));
    } catch (err) {
      console.error("Add comment error:", err);
      alert("Error adding comment");
    }
  };

  // 🔥 load DISCOVER feed from backend (all posts)
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
  }, []); // no dependency -> always discover, not tied to user.following

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = newNote.trim();

    // Require at least text OR media
    if (!trimmed && !file) return;
    if (!user?._id) return; // no user = no post

    try {
      const formData = new FormData();
      formData.append("authorId", user._id);
      formData.append("text", trimmed);
      if (file) {
        formData.append("media", file);
      }

      const res = await axios.post(`${API_BASE}/posts`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const created = res.data.post;
      // put new post at top
      setPosts((prev) => [created, ...prev]);

      setNewNote("");
      setFile(null);
      setFileInputKey((k) => k + 1); // clears file input
    } catch (err) {
      console.error("Create post error:", err);
      alert("Error creating post");
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files && e.target.files[0];
    setFile(selected || null);
  };

  // always show @username only
  const displayName = `@${user?.username || "user"}`;

  return (
    <div
      className="home-page"
      style={{ backgroundImage: `url(${bgTexture})` }}
    >
      <div className="home-overlay" />

      <div className="home-inner">
        {/* Shared Navbar */}
        <Navbar />

        {/* Main content */}
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

                {/* optional: clicking your own name goes to /profile */}
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
                          />
                        )}
                      </div>
                    )}

                    {post.text && (
                      <p className="home-note-text">{post.text}</p>
                    )}

                    <footer className="home-note-footer">
                      <button
                        type="button"
                        className={`home-note-icon-btn ${
                          isLiked ? "home-note-icon-btn--active" : ""
                        }`}
                        aria-label="Like"
                        onClick={() => handleToggleLike(post._id)}
                      >
                        👍 {likeCount > 0 && <span>{likeCount}</span>}
                      </button>

                      <button
                        type="button"
                        className="home-note-icon-btn"
                        aria-label="Comment"
                      >
                        💬{" "}
                        {comments.length > 0 && (
                          <span>{comments.length}</span>
                        )}
                      </button>

                      {isAuthor && (
                        <button
                          type="button"
                          className="home-note-icon-btn home-note-icon-btn--danger"
                          onClick={() => handleDeletePost(post._id)}
                        >
                          🗑️
                        </button>
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
                              handleCommentChange(
                                post._id,
                                e.target.value
                              )
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
    </div>
  );
};

export default Home;
