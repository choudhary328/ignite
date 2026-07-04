import React, { useState, useEffect, useContext } from "react";
import Admindasnav from "../components/Admindasnav";
import "./UsersPage.css";
import { UserContext } from "../context/UserContext";
import { useConfirm } from "../context/ConfirmContext";
import {
  RiDeleteBinLine,
  RiArrowUpDownLine,
  RiLockLine,
  RiLockUnlockLine,
  RiShieldCheckLine,
} from "react-icons/ri";

// --- Edit User Modal ---
// --- ENTIRE EditUserModal COMPONENT REMOVED ---

// --- User Row Sub-Component ---
// This component renders a single user in the table
// This component renders a single user in the table
const UserRow = ({ user, onDelete, onToggleStatus, onToggleVerify }) => {
  const createdDate = new Date(user.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const isActive = (user.status || "Active") === "Active";

  return (
    <tr className="user-table-row">
      <td className="user-table-cell">
        <div className="user-info-cell" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="user-avatar-sm" style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.875rem'
          }}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <div className="name-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="user-name" style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{user.name}</span>
              {user.isVerified && (
                <RiShieldCheckLine style={{ color: 'var(--green-500)', fontSize: '1rem' }} title="Verified Organization" />
              )}
            </div>
            <span className="user-email" style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{user.email}</span>
          </div>
        </div>
      </td>

      <td className="user-table-cell">
        <span className={`user-badge ${user.role === "admin" ? "badge-admin" : user.role === "org_admin" ? "badge-org" : "badge-user"}`}
          style={{
            padding: '0.25rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600,
            background: user.role === 'admin' ? '#fee2e2' : user.role === 'org_admin' ? '#e0e7ff' : '#f3f4f6',
            color: user.role === 'admin' ? '#991b1b' : user.role === 'org_admin' ? '#4338ca' : '#4b5563',
            textTransform: 'capitalize'
          }}>
          {user.role === 'org_admin' ? 'Organization' : user.role === 'admin' ? 'Super Admin' : 'Student'}
        </span>
      </td>

      <td className="user-table-cell" style={{ color: 'var(--gray-600)', fontWeight: 500 }}>
        {user.college || user.organization || <span style={{ opacity: 0.3 }}>—</span>}
      </td>

      <td className="user-table-cell">
        <span className={`user-status-badge ${isActive ? "status-active" : "status-blocked"}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.25rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
            background: isActive ? '#dcfce7' : '#f3f4f6',
            color: isActive ? '#166534' : '#6b7280'
          }}>
          {isActive ? "ACTIVE" : "BLOCKED"}
        </span>
      </td>

      <td className="user-table-cell" style={{ color: 'var(--gray-500)', fontSize: '0.8125rem' }}>{createdDate}</td>

      <td className="user-table-cell action-cell">
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button
            className={`action-btn ${isActive ? 'btn-block' : 'btn-unblock'}`}
            style={{
              width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--gray-200)',
              background: 'white', cursor: 'pointer', transition: '0.2s', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: isActive ? 'var(--gray-600)' : 'var(--indigo-600)'
            }}
            title={isActive ? "Block User" : "Unblock User"}
            onClick={() => onToggleStatus(user._id)}
          >
            {isActive ? <RiLockLine /> : <RiLockUnlockLine />}
          </button>

          {user.role === 'org_admin' && (
            <button
              className={`action-btn ${user.isVerified ? 'btn-unverify' : 'btn-verify'}`}
              style={{
                width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--gray-200)',
                background: user.isVerified ? 'var(--green-50)' : 'white', cursor: 'pointer',
                color: user.isVerified ? 'var(--green-600)' : 'var(--gray-400)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              title={user.isVerified ? "Unverify Organization" : "Verify Organization"}
              onClick={() => onToggleVerify(user._id)}
            >
              <RiShieldCheckLine />
            </button>
          )}

          <button
            className="action-btn btn-delete"
            style={{
              width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #fee2e2',
              background: 'white', color: '#ef4444', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title="Delete User"
            onClick={() => onDelete(user._id)}
          >
            <RiDeleteBinLine />
          </button>
        </div>
      </td>
    </tr>
  );
};

// --- Main Admin Users Page Component ---
function AdminUsersPage({ onLogout }) { // Removed setIsAuthenticated, uses onLogout
  const { currentUser } = useContext(UserContext);
  const { confirm } = useConfirm();
  const [users, setUsers] = useState([]); // The master list of users from DB
  const [filteredUsers, setFilteredUsers] = useState([]); // The list to actually render
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All Roles");
  const [filterStatus, setFilterStatus] = useState("All Status");

  // --- REMOVED: Modal States ---

  // 1. Fetch all users from API on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("igniteUserToken") || sessionStorage.getItem("igniteUserToken");
        if (!token) {
          throw new Error("No admin token found. Please log in.");
        }

        const response = await fetch("http://localhost:5000/api/users", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch users. Are you an admin?");
        }

        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data); // Initially, filtered list is the full list
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // 2. Apply filters whenever users list or filters change
  useEffect(() => {
    let result = users;

    // Filter by search term (name or email)
    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (filterRole !== "All Roles") {
      result = result.filter((user) => user.role === filterRole);
    }

    // Filter by status
    if (filterStatus !== "All Status") {
      result = result.filter((user) => (user.status || "Active") === filterStatus);
    }

    setFilteredUsers(result);
  }, [searchTerm, filterRole, filterStatus, users]);

  // 3. --- CRUD Handlers ---

  // --- REMOVED: handleEdit ---

  // Handle Toggle Status: Call API and update state
  // Handle Delete: Call API and update state
  const handleDelete = async (userId) => {
    const isConfirmed = await confirm("Are you sure you want to delete this user?", "Delete User");
    if (isConfirmed) {
      try {
        const token = localStorage.getItem("igniteUserToken") || sessionStorage.getItem("igniteUserToken");
        const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const data = await response.json(); // Get error message from backend
          throw new Error(data.message || "Failed to delete user.");
        }

        // Update state to remove user from the list
        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));

      } catch (err) {
        setError(err.message); // Show backend error to admin
      }
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const token = localStorage.getItem("igniteUserToken") || sessionStorage.getItem("igniteUserToken");
      const response = await fetch(`http://localhost:5000/api/users/${userId}/toggle-status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to toggle user status.");
      }

      const updatedUser = await response.json();

      // Update state with the new user status
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, status: updatedUser.status } : user
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle Toggle Verification
  const handleToggleVerify = async (userId) => {
    try {
      const token = localStorage.getItem("igniteUserToken") || sessionStorage.getItem("igniteUserToken");
      const response = await fetch(`http://localhost:5000/api/users/${userId}/toggle-verify`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to toggle verification status.");
      }

      const updatedData = await response.json();
      setUsers((prev) =>
        prev.map((u) => u._id === userId ? { ...u, isVerified: updatedData.isVerified } : u)
      );
    } catch (err) {
      setError(err.message);
    }
  };

  // --- REMOVED: handleSave ---

  return (
    <div className="admin-users-page">
      {/* Navbar */}
      <Admindasnav
        userName={currentUser?.name}
        userRole={currentUser?.role}
        imageUrl={currentUser?.imageUrl}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <main className="users-main-content">
        {/* Header: Title + Count */}
        <div className="users-header">
          <div className="users-header-info">
            <h1 className="users-title">Community Directory</h1>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--gray-500)', fontSize: '0.875rem', fontWeight: 500 }}>
              Manage users, verify organizations, and control access across the platform.
            </p>
          </div>
          <div className="users-count" style={{ display: 'flex', gap: '1rem' }}>
            <div className="count-pill" style={{ background: 'var(--indigo-50)', color: 'var(--indigo-600)', padding: '0.5rem 1rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.875rem', border: '1px solid var(--indigo-100)' }}>
              {users.filter(u => u.role === 'user').length} Students
            </div>
            <div className="count-pill" style={{ background: 'var(--green-50)', color: 'var(--green-600)', padding: '0.5rem 1rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.875rem', border: '1px solid var(--green-100)' }}>
              {users.filter(u => u.role === 'org_admin').length} Orgs
            </div>
          </div>
        </div>

        {/* Filter Box */}
        <div className="filter-box">
          <div className="filter-grid">
            {/* Search Box */}
            <div className="filter-item">
              <label htmlFor="search" className="filter-label">
                Search Users
              </label>
              <div className="input-wrapper">
                <i className="input-icon ri-search-line"></i>
                <input
                  id="search"
                  type="text"
                  placeholder="Search by name or email..."
                  className="filter-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="filter-item">
              <label htmlFor="role" className="filter-label">
                Filter by Role
              </label>
              <div className="input-wrapper">
                <select
                  id="role"
                  className="filter-select"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="All Roles">All Roles</option>
                  <option value="admin">Super Admin</option>
                  <option value="org_admin">Organization</option>
                  <option value="user">Student</option>
                </select>
              </div>
            </div>

            {/* Status Dropdown */}
            <div className="filter-item">
              <label htmlFor="status" className="filter-label">
                Filter by Status
              </label>
              <div className="input-wrapper">
                <select
                  id="status"
                  className="filter-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All Status">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th className="user-table-header">
                  User <RiArrowUpDownLine />
                </th>
                <th className="user-table-header">
                  Role <RiArrowUpDownLine />
                </th>
                <th className="user-table-header">
                  College / Org <RiArrowUpDownLine />
                </th>
                <th className="user-table-header">
                  Status <RiArrowUpDownLine />
                </th>
                <th className="user-table-header">
                  Created <RiArrowUpDownLine />
                </th>
                <th className="user-table-header action-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr className="empty-state-row">
                  <td colSpan="5">
                    <div className="empty-state">
                      <p className="empty-title">Loading users...</p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr className="empty-state-row">
                  <td colSpan="5">
                    <div className="empty-state">
                      <p className="empty-title" style={{ color: "#dc2626" }}>
                        Error: {error}
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && !error && filteredUsers.length === 0 && (
                <tr className="empty-state-row">
                  <td colSpan="5">
                    <div className="empty-state">
                      <i className="ri-user-line empty-icon"></i>
                      <h3 className="empty-title">No users found</h3>
                      <p className="empty-text">
                        No users match your current filters.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                filteredUsers.map((user) => (
                  <UserRow
                    key={user._id}
                    user={user}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                    onToggleVerify={handleToggleVerify}
                  />
                ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* --- REMOVED: Edit User Modal --- */}

    </div>
  );
}

export default AdminUsersPage;