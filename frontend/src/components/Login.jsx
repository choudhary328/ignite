import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import "./Auth.css"; // Use the new shared Auth CSS
import { RiEyeFill, RiEyeOffFill, RiMailLine, RiLockPasswordLine, RiCheckboxBlankCircleLine, RiCheckboxCircleFill } from "react-icons/ri";

const Login = () => {
  const { setCurrentUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
    // Clear field error when user starts typing
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, rememberMe }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Save token based on rememberMe preference
      if (rememberMe) {
        localStorage.setItem("igniteUserToken", data.token);
      } else {
        sessionStorage.setItem("igniteUserToken", data.token);
      }

      // Set user in global context
      setCurrentUser(data);

      // Navigate based on role
      if (data.role === "super_admin" || data.role === "admin") {
        navigate("/admindashboard");
      } else if (data.role === "org_admin") {
        navigate("/org-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">Ignite</Link>
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in to your account to continue</p>
        </div>

        {error && (
          <div className="error-message">
            <RiLockPasswordLine /> {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-group">
              <RiMailLine className="input-icon" />
              <input
                type="email"
                name="email"
                className={`form-input ${fieldErrors.email ? "input-error" : ""}`}
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            {fieldErrors.email && <span className="field-error-text">{fieldErrors.email}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-group">
              <RiLockPasswordLine className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className={`form-input ${fieldErrors.password ? "input-error" : ""}`}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <RiEyeOffFill /> : <RiEyeFill />}
              </button>
            </div>
            {fieldErrors.password && <span className="field-error-text">{fieldErrors.password}</span>}
          </div>

          {/* Options: Remember Me & Forgot Password */}
          <div className="form-options">
            <div
              className="remember-me"
              onClick={() => setRememberMe(!rememberMe)}
            >
              {rememberMe ? <RiCheckboxCircleFill color="var(--primary-color)" /> : <RiCheckboxBlankCircleLine />}
              <span>Remember me</span>
            </div>
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?
          <Link to="/signup" className="auth-link">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;