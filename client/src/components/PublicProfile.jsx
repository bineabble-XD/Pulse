import React, { useEffect, useState } from "react";
import bgTexture from "../assets/4.png";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { MdModeEdit, MdDeleteOutline } from "react-icons/md";

const API_BASE = "https://pulse-nahr.onrender.com";

function PublicProfile() {
  const { id } = useParams(); // this is actually username in your route
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  const [commentInputs, setCommentInputs] = useState({});
  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState("");

  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // -----------------------------------------------------
  // FETCH USER + POSTS
  // -----------------------------------------------------
  useEffect(() => {
    axios
      .get(`${API_BASE}/users/${id}`)
      .then((res) => {
        const fetchedUser = res.data.user;
        setUser(fetchedUser);

        // FIXED – now correctly checks real user._id
        if (currentUser?._id === fetchedUser._id) {
          setIsOwnProfile(true);
        } else {
          setIsOwnProfile(false);
        }
      })
      .catch(() => navigate("/home"));

    axios
      .get(`${API_BASE}/posts/user/${id}`)
      .then((res) => setPosts(res.data.posts))
      .catch(() => {});
  }, [id, currentUser]);

  // -----------------------------------------------------
  // LIKE POST
  // -----------------------------------------------------
  const handleToggleLike = async (postId) => {
    try {
      const res = await axios.put(`${API_BASE}/posts/like/${postId}`);
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? res.data.post : p))
      );
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  // -----------------------------------------------------
  // ADD COMMENT
  // -----------------------------------------------------
  const handleAddComment = async (postId) => {
    const comment = commentInputs[postId]?.trim();
    if (!comment) return;

    try {
      const res = await axios.post(`${API_BASE}/posts/comment/${postId}`, {
        text: comment,
      });

      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? res.data.post : p))
      );

      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  // -----------------------------------------------------
  // DELETE POST
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
  // EDIT POST
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

      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? res.data.post : p))
      );

      setEditingPostId(null);
      setEditText("");
    } catch (err) {
      console.error("Edit error:", err);
    }
  };

  if (!user) return null;

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
            // FIXED — supports both string or object author
            const authorId =
              typeof post.author === "string"
                ? post.author
                : post.author?._id;

            const isAuthor = authorId === currentUser?._id;

            const canEdit = isOwnProfile && isAuthor;

            const isEditing = editingPostId === post._id;

            const isLiked =
              currentUser && post.likes?.includes(currentUser._id);

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
                    {post.locationName && <span>{post.locationName}</span>}
                    <span>{new Date(post.createdAt).toLocaleString()}</span>
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
                      <button className="edit-cancel" onClick={cancelEditingPost}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* MEDIA */}
                {post.mediaUrl && (
                  <div className="profile-post-media">
                    {post.mediaType === "image" ? (
                      <img src={post.mediaUrl} alt="post" />
                    ) : (
                      <video src={post.mediaUrl} controls />
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
                    💬 {post.comments?.length}
                  </button>

                  {/* EDIT + DELETE (NOW FIXED) */}
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
