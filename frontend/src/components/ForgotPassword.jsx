import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Auth.css";
import { RiMailLine, RiArrowLeftLine, RiCheckboxCircleFill } from "react-icons/ri";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fieldError, setFieldError] = useState("");
    const [success, setSuccess] = useState(false);

    const validateForm = () => {
        if (!email) {
            setFieldError("Email is required");
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setFieldError("Please enter a valid email address");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setFieldError("");

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:5000/api/users/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            setSuccess(true);
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
                            <h2 className="auth-title">Check your email</h2>
                            <p className="auth-subtitle">
                                We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
                            </p>
                        </>
                    ) : (
                        <>
                            <h2 className="auth-title">Forgot your password?</h2>
                            <p className="auth-subtitle">
                                No worries! Enter your email and we'll send you a reset link.
                            </p>
                        </>
                    )}
                </div>

                {!success && (
                    <>
                        {error && (
                            <div className="error-message">
                                <RiMailLine /> {error}
                            </div>
                        )}

                        <form className="auth-form" onSubmit={handleSubmit} noValidate>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <div className="input-group">
                                    <RiMailLine className="input-icon" />
                                    <input
                                        type="email"
                                        className={`form-input ${fieldError ? "input-error" : ""}`}
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setError(null); setFieldError(""); }}
                                        disabled={isLoading}
                                    />
                                </div>
                                {fieldError && <span className="field-error-text">{fieldError}</span>}
                            </div>

                            <button type="submit" className="btn-primary" disabled={isLoading}>
                                {isLoading ? "Sending..." : "Send Reset Link"}
                            </button>
                        </form>
                    </>
                )}

                <div className="auth-footer">
                    <Link to="/login" className="auth-link back-link">
                        <RiArrowLeftLine /> Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
