import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./AboutPage.css";

const AboutPage = () => {
  const [feedback, setFeedback] = useState({
    name: "",
    email: "",
    rating: "5",
    comments: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeedback((prev) => ({ ...prev, [name]: value }));
    setSubmitted(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // Reset the feedback form after submit
    setFeedback({
      name: "",
      email: "",
      rating: "5",
      comments: "",
    });
  };

  return (
    <div className="about-page">
      <header className="about-header">
        <div className="about-header-inner">
          <Link to="/" className="about-logo">
            Ignite
          </Link>
          <nav className="about-nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/about" className="nav-link active">About</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
            <Link to="/login" className="btn btn-secondary">Sign In</Link>
            <Link to="/signup" className="btn btn-primary">Get Started</Link>
          </nav>
        </div>
      </header>

      <main className="about-main">
        <section className="about-hero">
          <div className="about-hero-content">
            <h1>About Ignite</h1>
            <p>
              Ignite is a modern event management platform that helps students and
              organizers create, discover, and participate in events with ease.
              From small workshops to large fests, Ignite keeps everything
              organised in one place.
            </p>
          </div>
        </section>

        <section className="about-grid">
          <article className="about-card">
            <h2>Why Ignite?</h2>
            <p>
              Our goal is to simplify event planning on campus. Ignite connects
              organisers and participants, provides real-time updates, and makes
              registrations and attendance tracking effortless.
            </p>
            <p>
              With role-based access, analytics, and a clean dashboard, Ignite is
              designed to feel fast, reliable, and familiar, whether you are an
              admin or a student looking for your next opportunity.
            </p>
            <div className="about-image-wrapper">
              <img
                className="about-image"
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80"
                alt="Students collaborating at an event"
              />
            </div>
          </article>

          <article className="about-card feedback-card">
            <h2>Feedback & Rating</h2>
            <p className="feedback-subtitle">
              Tell us what you think about the platform. Your feedback helps us
              improve Ignite.
            </p>
            <form className="feedback-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="fb-name">Name</label>
                <input
                  id="fb-name"
                  name="name"
                  type="text"
                  placeholder="Your name (optional)"
                  value={feedback.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="fb-email">Email</label>
                <input
                  id="fb-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com (optional)"
                  value={feedback.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="rating">Overall Rating</label>
                <select
                  id="rating"
                  name="rating"
                  value={feedback.rating}
                  onChange={handleChange}
                >
                  <option value="5">★★★★★ - Excellent</option>
                  <option value="4">★★★★☆ - Very Good</option>
                  <option value="3">★★★☆☆ - Good</option>
                  <option value="2">★★☆☆☆ - Needs Improvement</option>
                  <option value="1">★☆☆☆☆ - Poor</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="comments">Feedback</label>
                <textarea
                  id="comments"
                  name="comments"
                  rows="4"
                  placeholder="Share your ideas, issues, or suggestions..."
                  value={feedback.comments}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="feedback-submit-btn">
                Submit feedback
              </button>

              {submitted && (
                <p className="feedback-success">
                  Thank you! Your feedback has been recorded locally.
                </p>
              )}
            </form>
          </article>
        </section>
      </main>
    </div>
  );
};

export default AboutPage;
