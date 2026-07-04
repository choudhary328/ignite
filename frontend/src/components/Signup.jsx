import React, { useState } from "react";
import "./Auth.css"; // Use the new shared Auth CSS
import { useNavigate, Link } from "react-router-dom";
import { RiEyeFill, RiEyeOffFill, RiUserLine, RiMailLine, RiLockPasswordLine, RiPhoneLine, RiBookOpenLine, RiMapPinLine, RiBuildingLine } from "react-icons/ri";

const Signup = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("user"); // 'user' or 'org_admin'

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    contact2: "",
    college: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Update form fields
  const handleChange = (e) => {
    let { name, value } = e.target;

    // Numeric and length restriction for contact fields
    if (name === "contact" || name === "contact2") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setErrors({});
    setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = activeTab === "user" ? "Full name is required" : "Organization name is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.contact.trim()) {
      newErrors.contact = "Contact number is required";
    } else if (!/^\d{10}$/.test(formData.contact.trim())) {
      newErrors.contact = "Required 10-digit number";
    }

    if (formData.contact2 && !/^\d{10}$/.test(formData.contact2.trim())) {
      newErrors.contact2 = "Required 10-digit number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          contact: formData.contact,
          contact2: formData.contact2,
          college: formData.college,
          address: formData.address,
          password: formData.password,
          role: activeTab, // Use tab as role
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      navigate("/login");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: '480px' }}>
        <div className="auth-header">
          <Link to="/" className="auth-logo">Ignite</Link>
          <h2 className="auth-title">Create an account</h2>
          <p className="auth-subtitle">Join us to host or attend amazing events</p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="role-toggle">
          <button
            type="button"
            className={`role-tab ${activeTab === 'user' ? 'role-tab-active' : ''}`}
            onClick={() => handleTabSwitch('user')}
          >
            <RiUserLine /> Student / Participant
          </button>
          <button
            type="button"
            className={`role-tab ${activeTab === 'org_admin' ? 'role-tab-active' : ''}`}
            onClick={() => handleTabSwitch('org_admin')}
          >
            <RiBuildingLine /> Organization
          </button>
        </div>

        {serverError && (
          <div className="error-message">
            <RiUserLine /> {serverError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="form-group">
            <label className="form-label">
              {activeTab === 'user' ? 'Full Name' : 'Organization Name'} *
            </label>
            <div className="input-group">
              {activeTab === 'user' ? <RiUserLine className="input-icon" /> : <RiBuildingLine className="input-icon" />}
              <input
                type="text"
                name="name"
                className={`form-input ${errors.name ? "input-error" : ""}`}
                placeholder={activeTab === 'user' ? "John Doe" : "Acme Events Inc."}
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            {errors.name && <span className="field-error-text">{errors.name}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <div className="input-group">
              <RiMailLine className="input-icon" />
              <input
                type="email"
                name="email"
                className={`form-input ${errors.email ? "input-error" : ""}`}
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            {errors.email && <span className="field-error-text">{errors.email}</span>}
          </div>

          {/* Contact Numbers Row */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Contact Number *</label>
              <div className="input-group">
                <RiPhoneLine className="input-icon" />
                <input
                  type="text"
                  name="contact"
                  className={`form-input ${errors.contact ? "input-error" : ""}`}
                  placeholder="9876543210"
                  value={formData.contact}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              {errors.contact && <span className="field-error-text">{errors.contact}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Alternate Contact</label>
              <div className="input-group">
                <RiPhoneLine className="input-icon" />
                <input
                  type="text"
                  name="contact2"
                  className={`form-input ${errors.contact2 ? "input-error" : ""}`}
                  placeholder="9876543210"
                  value={formData.contact2}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              {errors.contact2 && <span className="field-error-text">{errors.contact2}</span>}
            </div>
          </div>

          {/* College / Address - contextual */}
          {activeTab === 'user' ? (
            <div className="form-group">
              <label className="form-label">College / School</label>
              <div className="input-group">
                <RiBookOpenLine className="input-icon" />
                <input
                  type="text"
                  name="college"
                  className="form-input"
                  placeholder="University Name"
                  value={formData.college}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Organization Address</label>
              <div className="input-group">
                <RiMapPinLine className="input-icon" />
                <input
                  type="text"
                  name="address"
                  className="form-input"
                  placeholder="123 Business Ave, City"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password *</label>
            <div className="input-group">
              <RiLockPasswordLine className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className={`form-input ${errors.password ? "input-error" : ""}`}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <RiEyeOffFill /> : <RiEyeFill />}
              </button>
            </div>
            {errors.password && <span className="field-error-text">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <div className="input-group">
              <RiLockPasswordLine className="input-icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className={`form-input ${errors.confirmPassword ? "input-error" : ""}`}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <RiEyeOffFill /> : <RiEyeFill />}
              </button>
            </div>
            {errors.confirmPassword && <span className="field-error-text">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating Account..." : activeTab === 'user' ? "Sign Up as Student" : "Sign Up as Organization"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?
          <Link to="/login" className="auth-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;