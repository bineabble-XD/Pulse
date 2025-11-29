import React, { useState, useMemo } from "react";
import logoBg from "../assets/LogoBg.png";

const MEMBERS = [
  {
    id: "P-1001",
    name: "ABBAS",
    email: "abbas@pulse.com",
    joinDate: "2023-01-12",
    status: "ACTIVE",
    phone: "11222",
  },
  {
    id: "P-1002",
    name: "KHALID",
    email: "khalid@pulse.com",
    joinDate: "2023-03-04",
    status: "ACTIVE",
    phone: "11222",
  },
  {
    id: "P-1003",
    name: "HASSAN",
    email: "hassan@pulse.com",
    joinDate: "2023-07-19",
    status: "NOT ACTIVE",
    phone: "11222",
  },
];

const Admin = () => {
  const [searchId, setSearchId] = useState("");

  const filteredMembers = useMemo(() => {
    if (!searchId.trim()) return MEMBERS;
    return MEMBERS.filter((m) =>
      m.id.toLowerCase().includes(searchId.trim().toLowerCase())
    );
  }, [searchId]);

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
          {/* Table */}
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
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="admin-empty-row">
                      No members found for this ID.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={member.id}>
                      <td>{member.name}</td>
                      <td>${member.id}</td>
                      <td>{member.email}</td>
                      <td>{member.joinDate}</td>
                      <td>
                        <span
                          className={`admin-status-pill ${
                            member.status === "ACTIVE"
                              ? "admin-status-pill--active"
                              : "admin-status-pill--inactive"
                          }`}
                        >
                          {member.status}
                        </span>
                      </td>
                      <td>{member.phone}</td>
                      <td>
                        <button className="admin-drop-btn">DROP</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Search by ID */}
          <div className="admin-search-section">
            <div className="admin-search-card">
              <span className="admin-search-label">SEARCH BY ID:</span>
              <div className="admin-search-controls">
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Type member ID…"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                />
                <button className="admin-search-btn">SEARCH</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Admin;
