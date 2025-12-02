import React, { useState, useMemo, useEffect } from "react";
import logoBg from "../assets/LogoBg.png";

const Admin = () => {
  const [members, setMembers] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch real users from backend
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch("http://localhost:6969/users");
        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await res.json();
        setMembers(data);
      } catch (err) {
        console.error(err);
        setError("Error loading members");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Filter by search (id, name, email)
  const filteredMembers = useMemo(() => {
    if (!searchId.trim()) return members;

    const q = searchId.trim().toLowerCase();

    return members.filter((m) => {
      const fullName = `${m.fname || ""} ${m.lname || ""}`.toLowerCase();
      const email = (m.email || "").toLowerCase();
      const id = (m._id || "").toLowerCase(); // MongoDB _id

      return (
        fullName.includes(q) ||
        email.includes(q) ||
        id.includes(q)
      );
    });
  }, [members, searchId]);

  return (
    <div className="admin-page">
      {/* Top bar */}
      <header className="admin-header">
        <div className="admin-logo-wrap">
          <img src={logoBg} alt="Pulse logo" className="admin-logo" />
          <span className="admin-logo-text">PULSE</span>
        </div>

        <nav className="admin-nav">
          <button className="admin-nav-link admin-nav-link--active">
            HOME
          </button>
          <button className="admin-nav-link">VIEW PROFILE</button>
          <button className="admin-nav-link admin-nav-link--danger">
            LOG OUT
          </button>
        </nav>
      </header>

      {/* Main content */}
      <main className="admin-content">
        <section className="admin-card">
          {/* Header */}
          <div className="admin-table-header">
            <h2 className="admin-card-title">MEMBERS</h2>
          </div>

          {/* Table */}
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>MEMBER NAME</th>
                  <th>MEMBER ID</th>
                  <th>MEMBER EMAIL</th>
                  <th>JOIN DATE</th>
                  <th>STATUS</th>
                  <th>PHONE NUMBER</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="admin-empty-row">
                      Loading members...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7" className="admin-empty-row">
                      {error}
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="admin-empty-row">
                      No members found.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                    const fullName = `${member.fname} ${member.lname}`;
                    const memberId = member._id;
                    const joinDate = member.createdAt
                      ? new Date(member.createdAt).toISOString().split("T")[0]
                      : "—";
                    const phone = member.phnum ?? "—";

                    return (
                      <tr key={memberId}>
                        <td>{fullName}</td>
                        <td>{memberId}</td>
                        <td>{member.email}</td>
                        <td>{joinDate}</td>
                        <td>
                          {/* For now, all are ACTIVE — you can add a real status field later */}
                          <span className="admin-status-pill admin-status-pill--active">
                            ACTIVE
                          </span>
                        </td>
                        <td>{phone}</td>
                        <td>
                          <button className="admin-drop-btn">DROP</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Search by ID / name / email */}
          <div className="admin-search-section">
            <div className="admin-search-card">
              <span className="admin-search-label">SEARCH:</span>
              <div className="admin-search-controls">
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Type ID, name, or email…"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                />
                <button className="admin-search-btn" type="button">
                  SEARCH
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Admin;
