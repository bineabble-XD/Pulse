// src/components/PostCard.jsx
import React from "react";
import { FcLike } from "react-icons/fc";
import { FaRegCommentDots } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";

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

const PostCard = ({
  post,
  currentUser,
  onLike,
  onDelete,
  onAddComment,
  onCommentChange,
  commentValue,
  onOpenImage,
  showDelete = false,
  onUsernameClick,
}) => {
  const likeCount = post.likes?.length || 0;
  const isLiked =
    currentUser &&
    Array.isArray(post.likes) &&
    post.likes.some((id) => id === currentUser._id);

  const comments = post.comments || [];
  const isAuthor =
    currentUser && post.author && post.author._id === currentUser._id;

  const hasLocation = post.location && post.location.trim() !== "";
  const createdLabel = formatDateTime(post.createdAt);

  return (
    <article className="home-note-card">
      {/* header */}
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
            <span
              className="home-note-username"
              style={{ cursor: onUsernameClick ? "pointer" : "default" }}
              onClick={() =>
                onUsernameClick && post.author?.username
                  ? onUsernameClick(post.author.username)
                  : null
              }
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
                    {createdLabel && <span className="home-note-meta-sep">•</span>}
                  </>
                )}
                <span className="home-note-meta-time">{createdLabel}</span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* media */}
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
              onClick={() => onOpenImage && onOpenImage(post.mediaUrl)}
            />
          )}
        </div>
      )}

      {/* text */}
      {post.text && <p className="home-note-text">{post.text}</p>}

      {/* footer buttons */}
      <footer className="home-note-footer">
        <button
          type="button"
          className={`home-note-icon-btn ${
            isLiked ? "home-note-icon-btn--active" : ""
          }`}
          aria-label="Like"
          onClick={() => onLike && onLike(post._id)}
        >
          <FcLike size={18} />
          {likeCount > 0 && <span className="home-note-icon-count">{likeCount}</span>}
        </button>

        <button
          type="button"
          className="home-note-icon-btn"
          aria-label="Comment"
        >
          <FaRegCommentDots size={16} />
          {comments.length > 0 && (
            <span className="home-note-icon-count">{comments.length}</span>
          )}
        </button>

        {showDelete && isAuthor && (
          <button
            type="button"
            className="home-note-icon-btn home-note-icon-btn--danger"
            onClick={() => onDelete && onDelete(post._id)}
          >
            <MdDeleteOutline size={18} />
          </button>
        )}
      </footer>

      {/* comments */}
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
                <span className="home-post-comment-text"> {c.text}</span>
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
              value={commentValue || ""}
              onChange={(e) =>
                onCommentChange && onCommentChange(post._id, e.target.value)
              }
            />
            <button
              className="home-post-comment-send"
              type="button"
              onClick={() => onAddComment && onAddComment(post._id)}
            >
              SEND
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default PostCard;
