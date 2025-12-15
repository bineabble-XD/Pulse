import React, { useRef, useState, useEffect } from "react";
import bgTexture from "../assets/6.png";

import Navbar from "./Navbar";
import { useSelector, useDispatch } from "react-redux";
import { updateProfilePic } from "../features/PulseSlice";
import axios from "axios";

import { FcLike } from "react-icons/fc";
import { FaRegCommentDots } from "react-icons/fa";
import { MdModeEdit, MdDeleteOutline } from "react-icons/md";

const API_BASE = "https://pulse-1-rke8.onrender.com";

const formatDateTime = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const monthShort = d.toLocaleString("en", { month: "short" });
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");

  return `${day} ${monthShort} · ${hours}:${mins}`;
};

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.users);

  const fileInputRef = useRef(null);
  const [localPreview, setLocalPreview] = useState("");

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState("");

  const [imageModal, setImageModal] = useState({
    open: false,
    url: "",
  });

  const [followingModal, setFollowingModal] = useState({
    open: false,
    loading: false,
    users: [],
    error: "",
  });

  const [followersModal, setFollowersModal] = useState({
    open: false,
    loading: false,
    users: [],
    error: "",
  });

  const [commentInputs, setCommentInputs] = useState({});

  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState("");

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

    const previewUrl = URL.createObjectURL(selected);
    setLocalPreview(previewUrl);

    dispatch(updateProfilePic(selected));
  };

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

  const handleCommentChange = (postId, value) => {
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: value,
    }));
  };

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

      setCommentInputs((prev) => ({
        ...prev,
        [postId]: "",
      }));
    } catch (err) {
      console.error("Add comment error:", err);
      alert("Error adding comment");
    }
  };

  const startEditingPost = (post) => {
    if (!post || !post._id) return;
    setEditingPostId(post._id);
    setEditText(post.text || "");
  };

  const cancelEditingPost = () => {
    setEditingPostId(null);
    setEditText("");
  };

  const handleSaveEdit = async (postId) => {
    if (!user?._id) return;

    const trimmed = (editText || "").trim();

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
        <Navbar />

        <main className="profile-content">
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
              >
                <span className="profile-stat-label">Followers</span>
                <span className="profile-stat-pill">{stats.followers}</span>
              </div>

              <div
                className="profile-stat-row profile-stat-row--clickable"
                onClick={handleOpenFollowing}
              >
                <span className="profile-stat-label">Following</span>
                <span className="profile-stat-pill">{stats.following}</span>
              </div>

              <div className="profile-stat-row">
                <span className="profile-stat-label">Posts</span>
                <span className="profile-stat-pill">{stats.posts}</span>
              </div>
            </div>
          </section>

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
                          <span className="home-note-username">
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
                                    <span className="home-note-meta-sep">
                                      •
                                    </span>
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
                      <button
                        type="button"
                        className={`home-note-icon-btn ${
                          isLiked ? "home-note-icon-btn--active" : ""
                        }`}
                        onClick={() => handleToggleLike(post._id)}
                      >
                        <FcLike size={18} />
                        {likeCount > 0 && (
                          <span className="home-note-icon-count">
                            {likeCount}
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        className="home-note-icon-btn"
                      >
                        <FaRegCommentDots size={16} />
                        {comments.length > 0 && (
                          <span className="home-note-icon-count">
                            {comments.length}
                          </span>
                        )}
                      </button>

                      {isAuthor && (
                        <>
                          <button
                            type="button"
                            className="home-note-icon-btn"
                            onClick={() => startEditingPost(post)}
                          >
                            <MdModeEdit size={18} />
                          </button>

                          <button
                            type="button"
                            className="home-note-icon-btn home-note-icon-btn--danger"
                            onClick={() => handleDeletePost(post._id)}
                          >
                            <MdDeleteOutline size={18} />
                          </button>
                        </>
                      )}
                    </footer>

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
              <p className="follow-modal-text">{followingModal.error}</p>
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
