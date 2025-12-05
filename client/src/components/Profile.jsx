// src/components/Profile.jsx
import React, { useRef, useState, useEffect } from "react";
import bgTexture from "../assets/4.png";
import Navbar from "./Navbar";
import { useSelector, useDispatch } from "react-redux";
import { updateProfilePic } from "../features/PulseSlice";
import axios from "axios";

const API_BASE = "http://localhost:6969";

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.users);

  const fileInputRef = useRef(null);
  const [localPreview, setLocalPreview] = useState("");

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState("");

  // fullscreen image modal
  const [imageModal, setImageModal] = useState({
    open: false,
    url: "",
  });

  // following list modal
  const [followingModal, setFollowingModal] = useState({
    open: false,
    loading: false,
    users: [],
    error: "",
  });

  // followers list modal
  const [followersModal, setFollowersModal] = useState({
    open: false,
    loading: false,
    users: [],
    error: "",
  });

  // per-post comment input values
  const [commentInputs, setCommentInputs] = useState({});

  // 🔥 Load YOUR posts from backend using /users/:username/profile
  useEffect(() => {
    const fetchMyProfile = async () => {
      if (!user?.username) {
        setLoadingPosts(false);
        return;
      }

      try {
        setLoadingPosts(true);
        setError("");
        const res = await axios.get(
          `${API_BASE}/users/${user.username}/profile`
        );

        // res.data = { user, posts }
        setPosts(res.data.posts || []);
      } catch (err) {
        console.error("Profile posts error:", err);
        setError("Error loading your posts");
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchMyProfile();
  }, [user?.username]);

  const handleChangePicClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files && e.target.files[0];
    if (!selected) return;

    // show instant preview
    const previewUrl = URL.createObjectURL(selected);
    setLocalPreview(previewUrl);

    // send to backend via Redux thunk (will include JWT)
    dispatch(updateProfilePic(selected));
  };

  // 🔥 Delete a post (no authorId body – backend uses token)
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

  // 👍 LIKE / UNLIKE (no userId body – backend uses token)
  const handleToggleLike = async (postId) => {
    if (!user?._id) return;

    try {
      const res = await axios.post(
        `${API_BASE}/posts/${postId}/like`,
        {}
      );

      const updated = res.data.post;
      setPosts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );
    } catch (err) {
      console.error("Like toggle error:", err);
      alert("Error toggling like");
    }
  };

  // 💬 handle typing comment
  const handleCommentChange = (postId, value) => {
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: value,
    }));
  };

  // 💬 submit comment (only text – backend uses token)
  const handleAddComment = async (postId) => {
    if (!user?._id) return;

    const text = (commentInputs[postId] || "").trim();
    if (!text) return;

    try {
      const res = await axios.post(
        `${API_BASE}/posts/${postId}/comment`,
        { text }
      );

      const updated = res.data.post;

      setPosts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );

      // clear input for that post
      setCommentInputs((prev) => ({
        ...prev,
        [postId]: "",
      }));
    } catch (err) {
      console.error("Add comment error:", err);
      alert("Error adding comment");
    }
  };

  // 🔥 open following list modal (JWT protected)
  const handleOpenFollowing = async () => {
    if (!user?._id) return;

    setFollowingModal({
      open: true,
      loading: true,
      users: [],
      error: "",
    });

    try {
      const res = await axios.get(
        `${API_BASE}/users/${user._id}/following-list`
      );
      setFollowingModal((prev) => ({
        ...prev,
        loading: false,
        users: res.data || [],
      }));
    } catch (err) {
      console.error("Following list error:", err);
      setFollowingModal((prev) => ({
        ...prev,
        loading: false,
        error: "Error loading following list",
      }));
    }
  };

  const handleCloseFollowing = () => {
    setFollowingModal((prev) => ({
      ...prev,
      open: false,
    }));
  };

  // 🔥 open followers list modal (JWT protected)
  const handleOpenFollowers = async () => {
    if (!user?._id) return;

    setFollowersModal({
      open: true,
      loading: true,
      users: [],
      error: "",
    });

    try {
      const res = await axios.get(
        `${API_BASE}/users/${user._id}/followers-list`
      );

      setFollowersModal((prev) => ({
        ...prev,
        loading: false,
        users: res.data || [],
      }));
    } catch (err) {
      console.error("Followers list error:", err);
      setFollowersModal((prev) => ({
        ...prev,
        loading: false,
        error: "Error loading followers",
      }));
    }
  };

  const handleCloseFollowers = () => {
    setFollowersModal((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const displayPic = localPreview || user?.profilePic || "";
  const username = user?.username || "user";

  const stats = {
    followers: user?.followers?.length || 0,
    following: user?.following?.length || 0,
    posts: posts.length,
  };

  return (
    <div
      className="profile-page"
      style={{ backgroundImage: `url(${bgTexture})` }}
    >
      <div className="profile-overlay" />

      <div className="profile-inner">
        {/* Shared Navbar */}
        <Navbar />

        {/* Main content */}
        <main className="profile-content">
          {/* Left column: profile card */}
          <section className="profile-sidebar">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar-circle">
                {displayPic ? (
                  <img
                    src={displayPic}
                    alt="Profile"
                    className="profile-avatar-image"
                  />
                ) : (
                  <span className="profile-avatar-icon">👤</span>
                )}
              </div>

              <button
                className="profile-change-btn"
                onClick={handleChangePicClick}
                disabled={isLoading}
              >
                {isLoading ? "UPDATING..." : "CHANGE PROFILE PICTURE"}
              </button>

              {/* hidden file input */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>

            <div className="profile-username">
              <h2>@{username}</h2>
            </div>

            <div className="profile-stats">
              <div
                className="profile-stat-row profile-stat-row--clickable"
                onClick={handleOpenFollowers}
                style={{ cursor: "pointer" }}
              >
                <span className="profile-stat-label">Followers</span>
                <span className="profile-stat-pill">
                  {stats.followers}
                </span>
              </div>

              <div
                className="profile-stat-row profile-stat-row--clickable"
                onClick={handleOpenFollowing}
                style={{ cursor: "pointer" }}
              >
                <span className="profile-stat-label">Following</span>
                <span className="profile-stat-pill">
                  {stats.following}
                </span>
              </div>

              <div className="profile-stat-row">
                <span className="profile-stat-label">Posts</span>
                <span className="profile-stat-pill">
                  {stats.posts}
                </span>
              </div>
            </div>
          </section>

          {/* Right column: your posts grid */}
          <section className="profile-feed">
            {loadingPosts ? (
              <p className="profile-empty-text">Loading your posts...</p>
            ) : error ? (
              <p className="profile-empty-text">{error}</p>
            ) : posts.length === 0 ? (
              <p className="profile-empty-text">
                You haven’t posted anything yet.
              </p>
            ) : (
              posts.map((post) => {
                const isAuthor =
                  user && post.author && post.author._id === user._id;

                const likeCount = post.likes?.length || 0;
                const isLiked =
                  user &&
                  Array.isArray(post.likes) &&
                  post.likes.some((id) => id === user._id);

                const comments = post.comments || [];
                const commentValue = commentInputs[post._id] || "";

                return (
                  <article key={post._id} className="profile-post-card">
                    <header className="profile-post-header">
                      <div className="profile-post-avatar">
                        {post.author?.profilePic || displayPic ? (
                          <img
                            src={post.author?.profilePic || displayPic}
                            alt="Profile"
                            className="profile-post-avatar-image"
                          />
                        ) : (
                          "👤"
                        )}
                      </div>
                      <span className="profile-post-username">
                        @{post.author?.username || username}
                      </span>
                    </header>

                    {post.text && (
                      <p className="profile-post-text">{post.text}</p>
                    )}

                    {post.mediaUrl && (
                      <div className="profile-post-media">
                        {post.mediaType === "video" ? (
                          <video
                            src={post.mediaUrl}
                            controls
                            className="profile-post-video"
                          />
                        ) : (
                          <img
                            src={post.mediaUrl}
                            alt="Post"
                            className="profile-post-image"
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

                    <footer className="profile-post-footer">
                      {/* LIKE BUTTON */}
                      <button
                        className={`profile-post-icon-btn ${
                          isLiked
                            ? "profile-post-icon-btn--active"
                            : ""
                        }`}
                        aria-label="Like"
                        onClick={() => handleToggleLike(post._id)}
                      >
                        👍 {likeCount > 0 && <span>{likeCount}</span>}
                      </button>

                      {/* COMMENT BUTTON (optional, decorative) */}
                      <button
                        className="profile-post-icon-btn"
                        aria-label="Comment"
                      >
                        💬{" "}
                        {comments.length > 0 && (
                          <span>{comments.length}</span>
                        )}
                      </button>

                      {isAuthor && (
                        <button
                          className="profile-post-icon-btn profile-post-icon-btn--danger"
                          onClick={() => handleDeletePost(post._id)}
                        >
                          🗑️
                        </button>
                      )}
                    </footer>

                    {/* COMMENTS SECTION */}
                    <div className="profile-post-comments">
                      {comments.length > 0 && (
                        <div className="profile-post-comments-list">
                          {comments.map((c) => (
                            <div
                              key={c._id || c.createdAt}
                              className="profile-post-comment"
                            >
                              <span className="profile-post-comment-author">
                                @{c.author?.username || "user"}
                              </span>
                              <span className="profile-post-comment-text">
                                {" "}
                                {c.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="profile-post-comment-input-row">
                        <input
                          type="text"
                          className="profile-post-comment-input"
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
                          className="profile-post-comment-send"
                          type="button"
                          onClick={() => handleAddComment(post._id)}
                        >
                          SEND
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </section>
        </main>
      </div>

      {/* 🔍 FULLSCREEN IMAGE MODAL */}
      {imageModal.open && (
        <div
          className="image-modal-backdrop"
          onClick={() => setImageModal({ open: false, url: "" })}
        >
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageModal.url}
              alt="Full"
              className="image-modal-img"
            />
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

      {/* 👥 FOLLOWING LIST MODAL */}
      {followingModal.open && (
        <div
          className="follow-modal-backdrop"
          onClick={handleCloseFollowing}
        >
          <div
            className="follow-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="follow-modal-header">
              <h3>Following</h3>
              <button
                className="follow-modal-close"
                type="button"
                onClick={handleCloseFollowing}
              >
                ✕
              </button>
            </div>

            {followingModal.loading ? (
              <p className="follow-modal-text">Loading...</p>
            ) : followingModal.error ? (
              <p className="follow-modal-text">
                {followingModal.error}
              </p>
            ) : followingModal.users.length === 0 ? (
              <p className="follow-modal-text">
                You’re not following anyone yet.
              </p>
            ) : (
              <ul className="follow-modal-list">
                {followingModal.users.map((u) => (
                  <li key={u._id} className="follow-modal-item">
                    <div className="follow-modal-avatar">
                      {u.profilePic ? (
                        <img
                          src={u.profilePic}
                          alt={u.username}
                          className="follow-modal-avatar-image"
                        />
                      ) : (
                        "👤"
                      )}
                    </div>
                    <div className="follow-modal-info">
                      <span className="follow-modal-username">
                        @{u.username}
                      </span>
                      {u.fname && u.lname && (
                        <span className="follow-modal-name">
                          <br /> {u.fname} {u.lname}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* 👥 FOLLOWERS LIST MODAL */}
      {followersModal.open && (
        <div
          className="follow-modal-backdrop"
          onClick={handleCloseFollowers}
        >
          <div
            className="follow-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="follow-modal-header">
              <h3>Followers</h3>
              <button
                className="follow-modal-close"
                type="button"
                onClick={handleCloseFollowers}
              >
                ✕
              </button>
            </div>

            {followersModal.loading ? (
              <p className="follow-modal-text">Loading...</p>
            ) : followersModal.error ? (
              <p className="follow-modal-text">
                {followersModal.error}
              </p>
            ) : followersModal.users.length === 0 ? (
              <p className="follow-modal-text">No followers yet.</p>
            ) : (
              <ul className="follow-modal-list">
                {followersModal.users.map((u) => (
                  <li key={u._id} className="follow-modal-item">
                    <div className="follow-modal-avatar">
                      {u.profilePic ? (
                        <img
                          src={u.profilePic}
                          alt={u.username}
                          className="follow-modal-avatar-image"
                        />
                      ) : (
                        "👤"
                      )}
                    </div>
                    <div className="follow-modal-info">
                      <span className="follow-modal-username">
                        @{u.username}
                      </span>
                      {u.fname && u.lname && (
                        <span className="follow-modal-name">
                          <br /> {u.fname} {u.lname}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
