import React, { useEffect, useState } from "react";
import bgTexture from "../assets/4.png";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
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

const PublicProfile = () => {
  // /u/:username
  const { username } = useParams();
  const { user: currentUser } = useSelector((state) => state.users);

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [commentInputs, setCommentInputs] = useState({});
  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState("");

  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile =
    currentUser && profileUser && currentUser._id === profileUser._id;

  // ============================
  // FETCH USER + POSTS
  // ============================
  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;

      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          `${API_BASE}/users/${username}/profile`
        );

        const fetchedUser = res.data.user || null;
        const fetchedPosts = res.data.posts || [];

        setProfileUser(fetchedUser);
        setPosts(fetchedPosts);

        // figure out if currentUser already follows this profile
        if (currentUser?._id && fetchedUser?._id) {
          const followingArray = currentUser.following || [];
          const already = followingArray.some((id) => {
            if (typeof id === "string") return id === fetchedUser._id;
            if (id?._id) return id._id === fetchedUser._id;
            return false;
          });
          setIsFollowing(already);
        } else {
          setIsFollowing(false);
        }
      } catch (err) {
        console.error("PublicProfile → fetch error:", err);
        setError(
          err.response?.data?.message || "Error loading profile"
        );
        setProfileUser(null);
        setPosts([]);
        setIsFollowing(false);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, currentUser?._id]);

  // ============================
  // FOLLOW / UNFOLLOW
  // ============================
  const handleToggleFollow = async () => {
    if (!currentUser?._id || !profileUser?._id) return;
    if (isOwnProfile) return; // just in case

    const myId = currentUser._id;
    const targetId = profileUser._id;

    try {
      if (isFollowing) {
        // UNFOLLOW
        await axios.post(`${API_BASE}/users/${myId}/unfollow`, {
          targetId,
        });

        setIsFollowing(false);
        // update local followers list
        setProfileUser((prev) => {
          if (!prev) return prev;
          const prevFollowers = prev.followers || [];
          const newFollowers = prevFollowers.filter((f) => {
            if (typeof f === "string") return f !== myId;
            if (f?._id) return f._id !== myId;
            return true;
          });
          return { ...prev, followers: newFollowers };
        });
      } else {
        // FOLLOW
        await axios.post(`${API_BASE}/users/${myId}/follow`, {
          targetId,
        });

        setIsFollowing(true);
        // update local followers list
        setProfileUser((prev) => {
          if (!prev) return prev;
          const prevFollowers = prev.followers || [];
          // avoid duplicates
          const already = prevFollowers.some((f) => {
            if (typeof f === "string") return f === myId;
            if (f?._id) return f._id === myId;
            return false;
          });
          if (already) return prev;

          return {
            ...prev,
            followers: [...prevFollowers, myId],
          };
        });
      }
    } catch (err) {
      console.error("PublicProfile → follow/unfollow error:", err);
    }
  };

  // ============================
  // LIKE
  // ============================
  const handleToggleLike = async (postId) => {
    if (!currentUser?._id) return;

    try {
      const res = await axios.post(`${API_BASE}/posts/${postId}/like`, {});
      const updated = res.data.post;
      setPosts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );
    } catch (err) {
      console.error("PublicProfile → like error:", err);
    }
  };

  // ============================
  // COMMENT
  // ============================
  const handleAddComment = async (postId) => {
    if (!currentUser?._id) return;

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
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("PublicProfile → comment error:", err);
    }
  };

  const handleCommentChange = (postId, value) => {
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: value,
    }));
  };

  // ============================
  // DELETE POST
  // ============================
  const handleDeletePost = async (postId) => {
    if (!currentUser?._id) return;
    if (!window.confirm("Delete this post?")) return;

    try {
      await axios.delete(`${API_BASE}/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error("PublicProfile → delete error:", err);
    }
  };

  // ============================
  // EDIT POST
  // ============================
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
    if (!currentUser?._id) return;

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
      console.error("PublicProfile → edit error:", err);
    }
  };

  // ============================
  // RENDER STATES
  // ============================
  if (loading) {
    return (
      <div
        className="profile-page"
        style={{ backgroundImage: `url(${bgTexture})` }}
      >
        <div className="profile-overlay" />
        <div className="profile-inner">
          <Navbar />
          <main className="profile-content">
            <p style={{ color: "white" }}>Loading profile...</p>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="profile-page"
        style={{ backgroundImage: `url(${bgTexture})` }}
      >
        <div className="profile-overlay" />
        <div className="profile-inner">
          <Navbar />
          <main className="profile-content">
            <p style={{ color: "salmon" }}>{error}</p>
          </main>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div
        className="profile-page"
        style={{ backgroundImage: `url(${bgTexture})` }}
      >
        <div className="profile-overlay" />
        <div className="profile-inner">
          <Navbar />
          <main className="profile-content">
            <p style={{ color: "white" }}>User not found.</p>
          </main>
        </div>
      </div>
    );
  }

  const stats = {
    followers: profileUser.followers?.length || 0,
    following: profileUser.following?.length || 0,
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
          {/* LEFT: profile card + FOLLOW BUTTON */}
          <section className="profile-sidebar">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar-circle">
                {profileUser.profilePic ? (
                  <img
                    src={profileUser.profilePic}
                    alt={profileUser.username}
                    className="profile-avatar-image"
                  />
                ) : (
                  <span className="profile-avatar-icon">👤</span>
                )}
              </div>
            </div>

            <div className="profile-username">
              <h2>@{profileUser.username}</h2>
            </div>

            {currentUser && !isOwnProfile && (
              <button
                className="profile-change-btn"
                type="button"
                onClick={handleToggleFollow}
              >
                {isFollowing ? "FOLLOWING" : "FOLLOW"}
              </button>
            )}

            <div className="profile-stats" style={{ marginTop: "16px" }}>
              <div className="profile-stat-row">
                <span className="profile-stat-label">Followers</span>
                <span className="profile-stat-pill">{stats.followers}</span>
              </div>
              <div className="profile-stat-row">
                <span className="profile-stat-label">Following</span>
                <span className="profile-stat-pill">{stats.following}</span>
              </div>
              <div className="profile-stat-row">
                <span className="profile-stat-label">Posts</span>
                <span className="profile-stat-pill">{stats.posts}</span>
              </div>
            </div>
          </section>

          {/* RIGHT: posts grid (same style as Home/Profile) */}
          <section className="profile-feed">
            {posts.length === 0 ? (
              <p className="profile-empty-text">
                No posts from @{profileUser.username} yet.
              </p>
            ) : (
              posts.map((post) => {
                const authorId =
                  typeof post.author === "string"
                    ? post.author
                    : post.author?._id;

                const isAuthor =
                  currentUser && authorId === currentUser._id;
                const isEditing = editingPostId === post._id;

                const likeCount = post.likes?.length || 0;
                const isLiked =
                  currentUser &&
                  Array.isArray(post.likes) &&
                  post.likes.some((id) => {
                    if (typeof id === "string") return id === currentUser._id;
                    if (id?._id) return id._id === currentUser._id;
                    return false;
                  });

                const comments = post.comments || [];
                const commentValue = commentInputs[post._id] || "";
                const createdLabel = formatDateTime(post.createdAt);
                const hasLocation =
                  post.location && post.location.trim() !== "";

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
                            @{post.author?.username || profileUser.username}
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

                      {isOwnProfile && isAuthor && (
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

                      {currentUser && (
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
    </div>
  );
};

export default PublicProfile;
