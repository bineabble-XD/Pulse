// src/components/PublicProfile.jsx
import React, { useEffect, useState } from "react";
import bgTexture from "../assets/4.png";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:6969";

const PublicProfile = () => {
  const { username } = useParams(); // /u/:username
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.users);

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);   // ✅ controls "Loading profile..."
  const [error, setError] = useState("");

  const [isFollowingLocal, setIsFollowingLocal] = useState(false);
  const [commentInputs, setCommentInputs] = useState({}); // per-post comment inputs

  const isOwnProfile =
    currentUser && profileUser && currentUser._id === profileUser._id;

  // 🔥 Load user + posts and init "am I following them?"
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(`${API_BASE}/users/${username}/profile`);
        const fetchedUser = res.data.user;

        setProfileUser(fetchedUser);
        setPosts(res.data.posts || []);

        // init follow state from followers[]
        if (currentUser?._id && fetchedUser?.followers) {
          const followers = fetchedUser.followers;
          const isF = followers.some(
            (id) => id.toString() === currentUser._id.toString()
          );
          setIsFollowingLocal(isF);
        } else {
          setIsFollowingLocal(false);
        }
      } catch (err) {
        console.error("Public profile error:", err);
        setError("Error loading profile");
      } finally {
        // ✅ make sure we stop showing "Loading profile..."
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, currentUser?._id]);

  // FOLLOW / UNFOLLOW
  const handleFollowToggle = async () => {
    if (!currentUser?._id || !profileUser?._id) return;

    const currentlyFollowing = isFollowingLocal;

    try {
      if (currentlyFollowing) {
        // UNFOLLOW
        await axios.post(
          `${API_BASE}/users/${currentUser._id}/unfollow`,
          { targetId: profileUser._id }
        );
      } else {
        // FOLLOW
        await axios.post(
          `${API_BASE}/users/${currentUser._id}/follow`,
          { targetId: profileUser._id }
        );
      }

      // flip local state so button text changes
      setIsFollowingLocal(!currentlyFollowing);

      // update followers in the viewed profile
      setProfileUser((prev) => {
        if (!prev) return prev;
        let followers = prev.followers || [];

        if (currentlyFollowing) {
          // was following → now unfollow
          followers = followers.filter(
            (id) => id.toString() !== currentUser._id.toString()
          );
        } else {
          // was not following → now follow
          if (
            !followers.some(
              (id) => id.toString() === currentUser._id.toString()
            )
          ) {
            followers = [...followers, currentUser._id];
          }
        }

        return { ...prev, followers };
      });
    } catch (err) {
      console.error("Follow toggle error:", err);
      alert("Error updating follow status");
    }
  };

  // LIKE / UNLIKE
  const handleToggleLike = async (postId) => {
    if (!currentUser?._id) return;

    try {
      const res = await axios.post(`${API_BASE}/posts/${postId}/like`, {
        userId: currentUser._id,
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

  // COMMENTS
  const handleCommentChange = (postId, value) => {
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: value,
    }));
  };

  const handleAddComment = async (postId) => {
    if (!currentUser?._id) return;

    const text = (commentInputs[postId] || "").trim();
    if (!text) return;

    try {
      const res = await axios.post(
        `${API_BASE}/posts/${postId}/comment`,
        {
          userId: currentUser._id,
          text,
        }
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

  // ================== RENDERING ==================

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
            <p className="profile-empty-text">Loading profile...</p>
          </main>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div
        className="profile-page"
        style={{ backgroundImage: `url(${bgTexture})` }}
      >
        <div className="profile-overlay" />
        <div className="profile-inner">
          <Navbar />
          <main className="profile-content">
            <p className="profile-empty-text">{error || "User not found"}</p>
          </main>
        </div>
      </div>
    );
  }

  const displayPic = profileUser.profilePic || "";
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
          {/* LEFT: user card */}
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

              {!isOwnProfile && currentUser && (
                <button
                  className="profile-change-btn"
                  onClick={handleFollowToggle}
                >
                  {isFollowingLocal ? "UNFOLLOW" : "FOLLOW"}
                </button>
              )}

              {isOwnProfile && (
                <button
                  className="profile-change-btn"
                  onClick={() => navigate("/profile")}
                >
                  EDIT PROFILE
                </button>
              )}
            </div>

            <div className="profile-username">
              <h2>@{profileUser.username}</h2>
            </div>

            <div className="profile-stats">
              <div className="profile-stat-row">
                <span className="profile-stat-label">Followers</span>
                <span className="profile-stat-pill">
                  {stats.followers}
                </span>
              </div>
              <div className="profile-stat-row">
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

          {/* RIGHT: posts */}
          <section className="profile-feed">
            {posts.length === 0 ? (
              <p className="profile-empty-text">
                This user hasn’t posted anything yet.
              </p>
            ) : (
              posts.map((post) => {
                const likeCount = post.likes?.length || 0;
                const isLiked =
                  currentUser &&
                  Array.isArray(post.likes) &&
                  post.likes.some((id) => id === currentUser._id);

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
                        @{post.author?.username || profileUser.username}
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
                            className="home-note-video"
                          />
                        ) : (
                          <img
                            src={post.mediaUrl}
                            alt="Post"
                            className="home-note-image"
                          />
                        )}
                      </div>
                    )}

                    <footer className="profile-post-footer">
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

                      <button
                        className="profile-post-icon-btn"
                        aria-label="Comment"
                      >
                        💬{" "}
                        {comments.length > 0 && (
                          <span>{comments.length}</span>
                        )}
                      </button>
                    </footer>

                    {/* COMMENTS – same styling as Home */}
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

export default PublicProfile;
