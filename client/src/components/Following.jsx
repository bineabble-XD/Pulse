import React, { useEffect, useState } from "react";
import bgTexture from "../assets/7.png";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "https://pulse-1-rke8.onrender.com";

const Following = () => {
  const { user } = useSelector((state) => state.users);
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});

  const [imageModal, setImageModal] = useState({
    open: false,
    url: "",
  });

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
      const res = await axios.post(`${API_BASE}/posts/${postId}/comment`, {
        userId: user._id,
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

  useEffect(() => {
    const fetchFollowing = async () => {
      if (!user?._id) {
        setLoadingFeed(false);
        return;
      }

      try {
        setLoadingFeed(true);
        const res = await axios.get(
          `${API_BASE}/posts/following/${user._id}`
        );
        setPosts(res.data || []);
      } catch (err) {
        console.error("Following feed error:", err);
      } finally {
        setLoadingFeed(false);
      }
    };

    fetchFollowing();
  }, [user?._id]);

  const displayName = `@${user?.username || "user"}`;

  return (
    <div
      className="home-page"
      style={{ backgroundImage: `url(${bgTexture})` }}
    >
      <div className="home-overlay" />

      <div className="home-inner">
        <Navbar />

        <main className="home-content">
          <section className="home-compose-wrapper">
            <div className="home-compose-card">
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
                  {displayName} – Following feed
                </span>
              </div>
              <p style={{ color: "white", marginTop: 8 }}>
                You’re seeing posts only from people you follow.
              </p>
            </div>
          </section>

          <section className="home-feed">
            {loadingFeed ? (
              <p style={{ color: "white" }}>Loading following feed...</p>
            ) : !user?._id ? (
              <p style={{ color: "white" }}>
                Log in to see your following feed.
              </p>
            ) : posts.length === 0 ? (
              <p style={{ color: "white" }}>
                No posts yet from people you follow.
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
    </div>
  );
};

export default Following;
