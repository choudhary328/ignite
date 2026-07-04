import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./ContactPage.css";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setStatus("");
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
      newErrors.email = "Enter a valid email";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Please enter your message";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message should be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setStatus("");

    try {
      const response = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to send message.");
      }

      setStatus("Message sent successfully. We'll get back to you soon.");
      // Reset form on success
      setFormData({ name: "", email: "", message: "" });
      setErrors({});
    } catch (err) {
      setStatus(err.message || "Failed to send message.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <header className="contact-header">
        <div className="contact-header-inner">
          <Link to="/" className="contact-logo">
            Ignite
          </Link>
          <nav className="contact-nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link active">Contact</Link>
            <Link to="/login" className="btn btn-secondary">Sign In</Link>
            <Link to="/signup" className="btn btn-primary">Get Started</Link>
          </nav>
        </div>
      </header>

      <main className="contact-hero">
        <div className="contact-overlay" />
        <div className="contact-hero-inner">
          <div className="contact-hero-text">
            <h1>Contact Us</h1>
            <p>
              Have a question, suggestion, or just want to say hello? Leave us a
              message and we will get back to you.
            </p>
          </div>

          <div className="contact-card" id="contact">
            <h2>Leave a Message</h2>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-row">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {errors.name && <p className="field-error">{errors.name}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && <p className="field-error">{errors.email}</p>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Write your message here..."
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                />
                {errors.message && <p className="field-error">{errors.message}</p>}
              </div>

              <div className="contact-actions">
                <button type="submit" className="contact-submit-btn" disabled={submitting}>
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </div>
              {status && <p className="contact-status-message">{status}</p>}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;
