import React, { useEffect, useState } from "react";
import bgTexture from "../assets/4.png";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { MdModeEdit, MdDeleteOutline } from "react-icons/md";

const API_BASE = "https://pulse-1-rke8.onrender.com";

function PublicProfile() {
  // in your routes this is actually :username → /u/:username
  const { id: username } = useParams();
  const navigate = useNavigate();

  // ✅ use PulseSlice, not old auth slice
  const { user: currentUser } = useSelector((state) => state.users);

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [commentInputs, setCommentInputs] = useState({});
  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState("");

  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // -----------------------------------------------------
  // FETCH USER + POSTS from /users/:username/profile
  // -----------------------------------------------------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          `${API_BASE}/users/${username}/profile`
        );

        const fetchedUser = res.data.user;
        const userPosts = res.data.posts || [];

        setUser(fetchedUser);
        setPosts(userPosts);

        if (currentUser?._id && fetchedUser?._id) {
          setIsOwnProfile(currentUser._id === fetchedUser._id);
        } else {
          setIsOwnProfile(false);
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError(
          err.response?.data?.message || "Error loading profile"
        );
        setUser(null);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username, currentUser?._id]);

  // -----------------------------------------------------
  // LIKE POST  → POST /posts/:id/like
  // -----------------------------------------------------
  const handleToggleLike = async (postId) => {
    try {
      const res = await axios.post(`${API_BASE}/posts/${postId}/like`, {
        // backend uses token via authMiddleware; body is extra
        userId: currentUser?._id,
      });

      const updated = res.data.post;
      setPosts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  // -----------------------------------------------------
  // ADD COMMENT  → POST /posts/:id/comment
  // -----------------------------------------------------
  const handleAddComment = async (postId) => {
    const comment = commentInputs[postId]?.trim();
    if (!comment) return;

    try {
      const res = await axios.post(
        `${API_BASE}/posts/${postId}/comment`,
        {
          text: comment,
          userId: currentUser?._id, // backend uses token
        }
      );

      const updated = res.data.post;
      setPosts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );

      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  // -----------------------------------------------------
  // DELETE POST  → DELETE /posts/:id
  // -----------------------------------------------------
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;

    try {
      await axios.delete(`${API_BASE}/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // -----------------------------------------------------
  // EDIT POST  → PUT /posts/:id
  // -----------------------------------------------------
  const startEditingPost = (post) => {
    setEditingPostId(post._id);
    setEditText(post.text || "");
  };

  const cancelEditingPost = () => {
    setEditingPostId(null);
    setEditText("");
  };

  const handleSaveEdit = async (postId) => {
    try {
      const res = await axios.put(`${API_BASE}/posts/${postId}`, {
        text: editText.trim(),
      });

      const updated = res.data.post;
      setPosts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );

      setEditingPostId(null);
      setEditText("");
    } catch (err) {
      console.error("Edit error:", err);
    }
  };

  // -----------------------------------------------------
  // RENDER
  // -----------------------------------------------------
  if (loading) {
    return (
      <div
        className="min-h-screen w-full bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${bgTexture})` }}
      >
        <p style={{ color: "white" }}>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen w-full bg-cover bg-center flex flex-col items-center justify-center"
        style={{ backgroundImage: `url(${bgTexture})` }}
      >
        <Navbar />
        <p style={{ color: "salmon", marginTop: 16 }}>{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="min-h-screen w-full bg-cover bg-center flex flex-col items-center justify-center"
        style={{ backgroundImage: `url(${bgTexture})` }}
      >
        <Navbar />
        <p style={{ color: "white", marginTop: 16 }}>User not found.</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${bgTexture})` }}
    >
      <Navbar />

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-avatar"></div>

          <h2>@{user.username}</h2>

          <div className="profile-stats">
            <p>Followers: {user.followers?.length || 0}</p>
            <p>Following: {user.following?.length || 0}</p>
            <p>Posts: {posts.length}</p>
          </div>
        </div>

        {/* POSTS */}
        <div className="profile-posts-wrapper">
          {posts.map((post) => {
            // supports both string or populated object author
            const authorId =
              typeof post.author === "string"
                ? post.author
                : post.author?._id;

            const isAuthor = authorId === currentUser?._id;
            const canEdit = isOwnProfile && isAuthor;
            const isEditing = editingPostId === post._id;

            const isLiked =
              currentUser &&
              Array.isArray(post.likes) &&
              post.likes.some((id) => {
                if (typeof id === "string") return id === currentUser._id;
                if (id?._id) return id._id === currentUser._id;
                return false;
              });

            const likeCount = post.likes?.length || 0;

            return (
              <article key={post._id} className="profile-post-card">
                {/* HEADER */}
                <header className="profile-post-header">
                  <div className="profile-post-user">
                    <div className="small-avatar"></div>
                    <span>@{user.username}</span>
                  </div>

                  <div className="profile-post-meta">
                    {post.location && <span>{post.location}</span>}
                    <span>
                      {post.createdAt
                        ? new Date(post.createdAt).toLocaleString()
                        : ""}
                    </span>
                  </div>
                </header>

                {/* TEXT / EDIT */}
                {!isEditing && post.text && (
                  <p className="profile-post-text">{post.text}</p>
                )}

                {isEditing && (
                  <div className="edit-box">
                    <textarea
                      className="edit-textarea"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    <div className="edit-actions">
                      <button
                        className="edit-save"
                        onClick={() => handleSaveEdit(post._id)}
                      >
                        Save
                      </button>
                      <button
                        className="edit-cancel"
                        onClick={cancelEditingPost}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* MEDIA */}
                {post.mediaUrl && (
                  <div className="profile-post-media">
                    {post.mediaType === "video" ? (
                      <video src={post.mediaUrl} controls />
                    ) : (
                      <img src={post.mediaUrl} alt="post" />
                    )}
                  </div>
                )}

                {/* FOOTER */}
                <footer className="profile-post-footer">
                  {/* LIKE */}
                  <button
                    className={`post-btn ${isLiked ? "liked" : ""}`}
                    onClick={() => handleToggleLike(post._id)}
                  >
                    ❤️ {likeCount > 0 && <span>{likeCount}</span>}
                  </button>

                  {/* COMMENT */}
                  <button className="post-btn">
                    💬 {post.comments?.length || 0}
                  </button>

                  {/* EDIT + DELETE */}
                  {canEdit && (
                    <>
                      <button
                        className="post-btn"
                        onClick={() => startEditingPost(post)}
                      >
                        <MdModeEdit size={18} />
                      </button>

                      <button
                        className="post-btn delete"
                        onClick={() => handleDeletePost(post._id)}
                      >
                        <MdDeleteOutline size={18} />
                      </button>
                    </>
                  )}
                </footer>

                {/* COMMENT INPUT */}
                <div className="comment-box">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentInputs[post._id] || ""}
                    onChange={(e) =>
                      setCommentInputs((prev) => ({
                        ...prev,
                        [post._id]: e.target.value,
                      }))
                    }
                  />
                  <button onClick={() => handleAddComment(post._id)}>
                    Send
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PublicProfile;
