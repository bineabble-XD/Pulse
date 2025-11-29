import React from "react";
import logoBg from "../assets/LogoBg.png";
import bgTexture from "../assets/4.png"; // you can switch to 1.png, 2.png, etc. if you like

const mockUser = {
  username: "User",
  id: "P-1003",
  followers: "1.2K",
  posts: 37,
};

const mockPosts = [
  {
    id: 1,
    text: "Today was one of those days that just felt right. I woke up in a good mood, got everything done on time, and even had some great conversations that made me smile. The weather was nice, my coffee hit perfectly, and nothing really went wrong — just a simple, genuinely good day that left me feeling content.",
  },
  {
    id: 2,
    text: "XXXXXXXXXX",
  },
  {
    id: 3,
    text: "XXXXXXXXXX",
  },
  {
    id: 4,
    text: "XXXXXXXXXX",
  },
];

const Profile = () => {
  return (
    <div
      className="profile-page"
      style={{ backgroundImage: `url(${bgTexture})` }}
    >
      <div className="profile-overlay" />

      <div className="profile-inner">
        {/* Top nav bar */}
        <header className="profile-header">
          <div className="profile-logo-wrap">
            <img src={logoBg} alt="Pulse logo" className="profile-logo" />
            <span className="profile-logo-text">PULSE</span>
          </div>

          <nav className="profile-nav">
            <button className="profile-nav-link profile-nav-link--active">
              HOME
            </button>
            <button className="profile-nav-link">VIEW PROFILE</button>
            <button className="profile-nav-link profile-nav-link--danger">
              LOG OUT
            </button>
          </nav>
        </header>

        {/* Main content */}
        <main className="profile-content">
          {/* Left column: profile card */}
          <section className="profile-sidebar">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar-circle">
                <span className="profile-avatar-icon">👤</span>
              </div>
              <button className="profile-change-btn">
                CHANGE PROFILE PICTURE
              </button>
            </div>

            <div className="profile-stats">
              <div className="profile-stat-row">
                <span className="profile-stat-label">ID:</span>
                <span className="profile-stat-pill">{mockUser.id}</span>
              </div>
              <div className="profile-stat-row">
                <span className="profile-stat-label">Followers</span>
                <span className="profile-stat-pill">{mockUser.followers}</span>
              </div>
              <div className="profile-stat-row">
                <span className="profile-stat-label">Posts</span>
                <span className="profile-stat-pill">{mockUser.posts}</span>
              </div>
            </div>
          </section>

          {/* Right column: posts grid */}
          <section className="profile-feed">
            {mockPosts.map((post) => (
              <article key={post.id} className="profile-post-card">
                <header className="profile-post-header">
                  <div className="profile-post-avatar">👤</div>
                  <span className="profile-post-username">
                    @{mockUser.username}
                  </span>
                </header>

                <p className="profile-post-text">{post.text}</p>

                <footer className="profile-post-footer">
                  <button className="profile-post-icon-btn" aria-label="Like">
                    👍
                  </button>
                  <button
                    className="profile-post-icon-btn"
                    aria-label="Comment"
                  >
                    💬
                  </button>
                </footer>
              </article>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
};

export default Profile;
