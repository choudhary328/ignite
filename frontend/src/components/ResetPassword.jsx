import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./Auth.css";
import { RiLockPasswordLine, RiEyeFill, RiEyeOffFill, RiCheckboxCircleFill } from "react-icons/ri";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setFieldErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await fetch(`http://localhost:5000/api/users/reset-password/${token}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Reset failed");
            }

            setSuccess(true);
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-header">
                    <Link to="/" className="auth-logo">Ignite</Link>

                    {success ? (
                        <>
                            <div className="success-icon-wrap">
                                <RiCheckboxCircleFill className="success-icon" />
                            </div>
                            <h2 className="auth-title">Password reset!</h2>
                            <p className="auth-subtitle">
                                Your password has been changed successfully. Redirecting you to sign in...
                            </p>
                        </>
                    ) : (
                        <>
                            <h2 className="auth-title">Set a new password</h2>
                            <p className="auth-subtitle">
                                Enter your new password below. Make sure it's at least 6 characters.
                            </p>
                        </>
                    )}
                </div>

                {!success && (
                    <>
                        {error && (
                            <div className="error-message">
                                <RiLockPasswordLine /> {error}
                            </div>
                        )}

                        <form className="auth-form" onSubmit={handleSubmit} noValidate>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <div className="input-group">
                                    <RiLockPasswordLine className="input-icon" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className={`form-input ${fieldErrors.password ? "input-error" : ""}`}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setError(null); setFieldErrors(prev => ({ ...prev, password: "" })); }}
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

                            <div className="form-group">
                                <label className="form-label">Confirm New Password</label>
                                <div className="input-group">
                                    <RiLockPasswordLine className="input-icon" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        className={`form-input ${fieldErrors.confirmPassword ? "input-error" : ""}`}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => { setConfirmPassword(e.target.value); setError(null); setFieldErrors(prev => ({ ...prev, confirmPassword: "" })); }}
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <RiEyeOffFill /> : <RiEyeFill />}
                                    </button>
                                </div>
                                {fieldErrors.confirmPassword && <span className="field-error-text">{fieldErrors.confirmPassword}</span>}
                            </div>

                            <button type="submit" className="btn-primary" disabled={isLoading}>
                                {isLoading ? "Resetting..." : "Reset Password"}
                            </button>
                        </form>
                    </>
                )}

                <div className="auth-footer">
                    <Link to="/login" className="auth-link">Back to Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
