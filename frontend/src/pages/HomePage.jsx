import React from "react";
import { Link } from "react-router-dom"; // ✅ Use React Router for links
import "./HomePage.css";

const features = [
  {
    title: "Event Management",
    description: "Create, manage, and organize events with comprehensive tools and real-time updates.",
    iconClass: "calendar-event",
    gradient: "blue-gradient",
  },
  {
    title: "Role-Based Access",
    description: "Secure authentication with admin and user roles for proper access control.",
    iconClass: "user-settings",
    gradient: "purple-gradient",
  },
  {
    title: "Event Participation",
    description: "Join events, track participants, and manage capacity with real-time availability.",
    iconClass: "group",
    gradient: "green-gradient",
  },
  {
    title: "Analytics Dashboard",
    description: "Comprehensive analytics and insights for events, users, and participation metrics.",
    iconClass: "dashboard",
    gradient: "orange-gradient",
  },
  {
    title: "Smart Search",
    description: "Advanced filtering and search capabilities to find events by category and date.",
    iconClass: "search",
    gradient: "teal-gradient",
  },
  {
    title: "Mobile Responsive",
    description: "Fully responsive design that works seamlessly across all devices and screen sizes.",
    iconClass: "smartphone",
    gradient: "indigo-gradient",
  },
];

const statsData = [
  { number: "10K+", label: "Events Created" },
  { number: "50K+", label: "Active Users" },
  { number: "500K+", label: "Registrations" },
  { number: "99.9%", label: "Uptime" },
];

const HomePage = () => {
  return (
    <div className="home-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="logo">Ignite</h1>
          <nav className="nav-links">
            <a href="#features">Features</a>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/login" className="btn-signin">Sign In</Link>
            <Link to="/signup" className="btn-get-started">Get Started</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Ignite Your Events, <br />
              <span className="hero-highlight">Spark Success</span>
            </h1>
            <p className="hero-description">
              The ultimate event management platform that brings organizers and
              participants together. Create, manage, and join events with powerful
              tools and seamless user experience.
            </p>
            <div className="hero-buttons">
              <Link to="/signup" className="btn-primary">
                Start Creating Events
              </Link>
              <Link to="/login" className="btn-secondary">
                View Events
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="features-container">
          <div className="features-header">
            <h2 className="features-title">Powerful Features for Event Success</h2>
            <p className="features-subtitle">
              Everything you need to create, manage, and participate in events with complete control and analytics.
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className={`feature-icon ${feature.gradient}`}>
                  <i className={`ri-${feature.iconClass}-fill`}></i>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stats-header">
            <h2 className="stats-title">Trusted by Event Creators Worldwide</h2>
            <p className="stats-subtitle">
              Join thousands of successful event organizers using Ignite
            </p>
          </div>
          <div className="stats-grid">
            {statsData.map((stat, index) => (
              <div key={index} className="stats-item">
                <div className="stats-number">{stat.number}</div>
                <div className="stats-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Get Started?</h2>
          <p className="cta-subtitle">
            Join Ignite today and transform how you create and manage events. Start your journey with our powerful platform.
          </p>
          <div className="cta-buttons">
            <Link to="/signup" className="btn-primary">
              Create Free Account
            </Link>
            <Link to="/login" className="btn-secondary">
              Sign In
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
