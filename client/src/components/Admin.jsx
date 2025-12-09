// src/components/Admin.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import AdminNavbar from "./AdminNavbar";

const API_BASE = "https://pulse-nahr.onrender.com";

const Admin = () => {
  const { user } = useSelector((state) => state.users);

  const [members, setMembers] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Load members (admin-only route)
  useEffect(() => {
    if (!user) return;

    const fetchMembers = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(`${API_BASE}/users`);
        setMembers(res.data || []);
      } catch (err) {
        console.error("Admin /users error:", err);
        setError("Error loading members");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [user]);

  // 🔥 DROP member handler
  const handleDropMember = async (memberId) => {
    const confirmDrop = window.confirm(
      "Are you sure you want to drop this member? This will delete their account and posts."
    );
    if (!confirmDrop) return;

    try {
      await axios.delete(`${API_BASE}/users/${memberId}`);
      // remove from local state so UI updates instantly
      setMembers((prev) => prev.filter((m) => m._id !== memberId));
    } catch (err) {
      console.error("Delete user error:", err);
      alert("Error dropping member");
    }
  };

  // 🔍 Filter by search (id, name, email)
  const filteredMembers = useMemo(() => {
    if (!searchId.trim()) return members;

    const q = searchId.trim().toLowerCase();

    return members.filter((m) => {
      const fullName = `${m.fname || ""} ${m.lname || ""}`.toLowerCase();
      const email = (m.email || "").toLowerCase();
      const id = (m._id || "").toLowerCase();

      return fullName.includes(q) || email.includes(q) || id.includes(q);
    });
  }, [members, searchId]);

  const getStatusLabel = (member) => {
    // later you can replace this with a real isActive flag
    return "ACTIVE";
  };

  return (
    <div className="admin-page">
      <AdminNavbar />

      <main className="admin-content">
        <section className="admin-card">
          <div className="admin-table-header">
            <h2 className="admin-card-title">MEMBERS</h2>
          </div>

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
                    const fullName = `${member.fname || ""} ${
                      member.lname || ""
                    }`.trim();
                    const memberId = member._id;
                    const joinDate = member.createdAt
                      ? new Date(member.createdAt)
                          .toISOString()
                          .split("T")[0]
                      : "—";
                    const phone = member.phnum ?? "—";
                    const statusLabel = getStatusLabel(member);

                    return (
                      <tr key={memberId}>
                        <td>{fullName || "—"}</td>
                        <td>{memberId}</td>
                        <td>{member.email || "—"}</td>
                        <td>{joinDate}</td>
                        <td>
                          <span
                            className={`admin-status-pill ${
                              statusLabel === "ACTIVE"
                                ? "admin-status-pill--active"
                                : "admin-status-pill--inactive"
                            }`}
                          >
                            {statusLabel}
                          </span>
                        </td>
                        <td>{phone}</td>
                        <td>
                          <button
                            className="admin-drop-btn"
                            type="button"
                            onClick={() => handleDropMember(memberId)}
                          >
                            DROP
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

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
