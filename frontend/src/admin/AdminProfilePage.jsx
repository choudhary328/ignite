import React, { useState, useEffect, useContext } from "react";
import Admindasnav from "../components/Admindasnav";
import { UserContext } from "../context/UserContext";
import "./AdminProfilePage.css"; // Uses the same styles as ProfilePage
import {
  RiEditLine,
  RiCalendarCheckFill,
  RiCalendarScheduleFill,
  RiHistoryFill,
} from "react-icons/ri";

const AdminProfilePage = ({ onLogout }) => {
  const { currentUser, setCurrentUser, refetchUser } = useContext(UserContext);

  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Stats for Admin (Events Created)
  const [eventStats, setEventStats] = useState({
    total: 0,
    upcoming: 0,
    past: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form data for editing
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    contact2: "",
    college: "",
    address: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});

  // Refetch user data on mount
  useEffect(() => {
    refetchUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch Admin's Events for Stats
  useEffect(() => {
    const fetchOrgEvents = async () => {
      if (!currentUser) return;
      try {
        const token = localStorage.getItem("igniteUserToken") || sessionStorage.getItem("igniteUserToken");
        // Fetch events created by this org
        const response = await fetch(`http://localhost:5000/api/events?organization=${currentUser._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const events = await response.json();
          const now = new Date();
          const upcoming = events.filter(e => new Date(e.date) > now).length;
          const past = events.filter(e => new Date(e.date) <= now).length;

          setEventStats({
            total: events.length,
            upcoming,
            past
          });
        }
      } catch (err) {
        console.error("Failed to fetch event stats", err);
      }
    };

    fetchOrgEvents();
  }, [currentUser]);


  // Sync formData when currentUser data loads
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        contact: currentUser?.contact || "",
        contact2: currentUser?.contact2 || "",
        college: currentUser?.college || "",
        address: currentUser?.address || "",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setFieldErrors({});
      setImagePreview(null);
    }
  }, [currentUser, isEditing]);

  // Handle input changes
  const handleInputChange = (e) => {
    let { name, value } = e.target;

    // Numeric and length restriction for contact field
    if (name === "contact" || name === "contact2") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Handle profile image file selection
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (formData.contact && !/^\d{10}$/.test(formData.contact.trim())) {
      newErrors.contact = "Required 10-digit number";
    }
    if (formData.contact2 && !/^\d{10}$/.test(formData.contact2.trim())) {
      newErrors.contact2 = "Required 10-digit number";
    }

    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters";
      }
      if (!formData.currentPassword) {
        newErrors.currentPassword = "Current password is required to change password";
      }
      if (formData.newPassword !== formData.confirmNewPassword) {
        newErrors.confirmNewPassword = "Passwords do not match";
      }
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save Changes
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!validateForm()) return;

    setLoading(true);

    const token = localStorage.getItem("igniteUserToken") || sessionStorage.getItem("igniteUserToken");
    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('email', formData.email);
    payload.append('contact', formData.contact);
    payload.append('contact2', formData.contact2);
    payload.append('college', formData.college);
    payload.append('address', formData.address);

    if (formData.newPassword && formData.currentPassword) {
      payload.append('currentPassword', formData.currentPassword);
      payload.append('newPassword', formData.newPassword);
    }

    const fileInput = document.getElementById('profileImageUpload');
    if (fileInput && fileInput.files[0]) {
      payload.append('image', fileInput.files[0]);
    }

    try {
      const response = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile.");
      }

      setCurrentUser(data);
      // Save token back to the correct storage
      if (localStorage.getItem("igniteUserToken")) {
        localStorage.setItem("igniteUserToken", data.token);
      } else {
        sessionStorage.setItem("igniteUserToken", data.token);
      }
      setIsEditing(false);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return <div className="profile-page"><p>Loading profile...</p></div>;
  }

  return (
    <div className="profile-page">
      <Admindasnav userName={currentUser.name} userRole={currentUser.role} imageUrl={currentUser.imageUrl} onLogout={onLogout} />

      <main className="profile-main">
        {/* --- HEADER --- */}
        <div className="profile-card user-header-card">
          <div className="user-avatar-section">
            <div className="user-avatar-wrapper">
              <img
                src={imagePreview || currentUser.imageUrl || `https://placehold.co/150x150/eef2ff/4f46e5?text=${currentUser.name?.charAt(0)}`}
                alt={currentUser.name}
                className="user-avatar-img"
              />
              {isEditing && (
                <div className="avatar-edit-overlay">
                  <label htmlFor="profileImageUpload" className="avatar-upload-label">
                    <RiEditLine /> Change
                  </label>
                  <input type="file" id="profileImageUpload" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                </div>
              )}
            </div>
            <div className="user-info-header">
              <h2 className="user-name">{currentUser.name}</h2>
              <p className="user-email">{currentUser.email}</p>
              <div className="user-badges">
                <span className="badge badge-role">{currentUser.role}</span>
                <span className="badge badge-status">{currentUser.status || "Active"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- CONDITIONAL RENDERING --- */}
        {!isEditing ? (
          <>
            {/* VIEW MODE */}
            <div className="profile-card profile-info-card">
              <div className="card-header">
                <h3 className="card-title">Profile Information</h3>
                <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                  <RiEditLine /> Edit Profile
                </button>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Organization ID</span>
                  <span className="info-value">{currentUser.userId || currentUser._id}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Organization Name</span>
                  <span className="info-value">{currentUser.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value">{currentUser.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Contact</span>
                  <span className="info-value">{currentUser.contact || "Not set"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Alternate Contact</span>
                  <span className="info-value">{currentUser.contact2 || "Not set"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Address</span>
                  <span className="info-value">{currentUser.address || "Not set"}</span>
                </div>
              </div>
            </div>

            {/* --- EVENT STATS --- */}
            <div className="profile-card event-stats-card">
              <div className="card-header">
                <h3 className="card-title">Organization Statistics</h3>
              </div>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-icon blue">
                    <RiCalendarCheckFill />
                  </div>
                  <p className="stat-count">{eventStats.total}</p>
                  <p className="stat-label">Total Events Created</p>
                </div>
                <div className="stat-item">
                  <div className="stat-icon green">
                    <RiCalendarScheduleFill />
                  </div>
                  <p className="stat-count">{eventStats.upcoming}</p>
                  <p className="stat-label">Upcoming Events</p>
                </div>
                <div className="stat-item">
                  <div className="stat-icon purple">
                    <RiHistoryFill />
                  </div>
                  <p className="stat-count">{eventStats.past}</p>
                  <p className="stat-label">Past Events</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* EDIT MODE */
          <form className="profile-card profile-edit-card" onSubmit={handleSaveChanges} noValidate>
            <h3 className="card-title">Edit Profile</h3>
            {error && <div className="form-error-banner" style={{ marginBottom: '1.5rem' }}><span>⚠</span> {error}</div>}

            <div className="form-grid-edit">
              <div className="form-group">
                <label className="form-label" htmlFor="name">Organization Name *</label>
                <input id="name" name="name" type="text" className={`form-input ${fieldErrors.name ? "input-error" : ""}`} value={formData.name} onChange={handleInputChange} disabled={loading} />
                {fieldErrors.name && <span className="field-error-text">{fieldErrors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email *</label>
                <input id="email" name="email" type="email" className={`form-input ${fieldErrors.email ? "input-error" : ""}`} value={formData.email} onChange={handleInputChange} disabled={loading} />
                {fieldErrors.email && <span className="field-error-text">{fieldErrors.email}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="contact">Contact Number</label>
                <input id="contact" name="contact" type="text" className={`form-input ${fieldErrors.contact ? "input-error" : ""}`} value={formData.contact} onChange={handleInputChange} placeholder="+91 98765 43210" disabled={loading} />
                {fieldErrors.contact && <span className="field-error-text">{fieldErrors.contact}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="contact2">Alternate Contact</label>
                <input id="contact2" name="contact2" type="text" className={`form-input ${fieldErrors.contact2 ? "input-error" : ""}`} value={formData.contact2} onChange={handleInputChange} placeholder="+91 98765 43210" disabled={loading} />
                {fieldErrors.contact2 && <span className="field-error-text">{fieldErrors.contact2}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="address">Address</label>
              <textarea id="address" name="address" className="form-textarea" rows="2" value={formData.address} onChange={handleInputChange} placeholder="Enter address" disabled={loading} />
            </div>

            <h3 className="password-section-title">Change Password (Optional)</h3>
            <div className="form-grid-password">
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input name="currentPassword" type="password" className={`form-input ${fieldErrors.currentPassword ? "input-error" : ""}`} value={formData.currentPassword} onChange={handleInputChange} placeholder="••••••••" disabled={loading} />
                {fieldErrors.currentPassword && <span className="field-error-text">{fieldErrors.currentPassword}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input name="newPassword" type="password" className={`form-input ${fieldErrors.newPassword ? "input-error" : ""}`} value={formData.newPassword} onChange={handleInputChange} placeholder="••••••••" disabled={loading} />
                {fieldErrors.newPassword && <span className="field-error-text">{fieldErrors.newPassword}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input name="confirmNewPassword" type="password" className={`form-input ${fieldErrors.confirmNewPassword ? "input-error" : ""}`} value={formData.confirmNewPassword} onChange={handleInputChange} placeholder="••••••••" disabled={loading} />
                {fieldErrors.confirmNewPassword && <span className="field-error-text">{fieldErrors.confirmNewPassword}</span>}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel-edit" onClick={() => setIsEditing(false)} disabled={loading}>Cancel</button>
              <button type="submit" className="btn-save" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default AdminProfilePage;
