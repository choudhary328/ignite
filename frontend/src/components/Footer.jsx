import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const location = useLocation();

  if (location.pathname === "/login" || location.pathname === "/signup") {
    return null;
  }

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand & Social */}
          <div className="footer-brand">
            <h3 className="footer-logo">Ignite</h3>
            <p className="footer-description">
              The ultimate event management platform that brings organizers and participants together with powerful tools and seamless experience.
            </p>
            <div className="footer-socials">
              <i className="ri-twitter-fill"></i>
              <i className="ri-facebook-fill"></i>
              <i className="ri-instagram-line"></i>
              <i className="ri-linkedin-fill"></i>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Features</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/login">Sign In</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="footer-support">
            <h4>Support</h4>
            <ul>
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><a href="#made" target="_blank" rel="noopener noreferrer">Made with ❤️</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="footer-bottom">
          <p>© 2025 Ignite. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
