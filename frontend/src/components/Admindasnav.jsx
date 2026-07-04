import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Admindasnav.css";
import { getImageUrl } from "../utils/imageUrl";
import {
    RiUserFill,
    RiLogoutBoxLine,
    RiDashboardLine,
    RiCalendarEventLine,
    RiUserLine,
    RiBellLine,
    RiMoonLine,
    RiSunLine,
} from "react-icons/ri";
import { ThemeContext } from "../context/ThemeContext";
import { useContext } from "react";

const Admindasnav = ({ userName, userRole, imageUrl, onLogout }) => {
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useContext(ThemeContext);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isDropdownOpen && !event.target.closest('.user-profile-wrapper')) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isDropdownOpen]);

    const handleLogout = () => {
        if (onLogout) onLogout();
        navigate("/login");
    };

    return (
        <header className="navbar-header">
            <div className="navbar-container">
                <div className="navbar-top">
                    <div className="logo-section">
                        <h1 className="brand-logo" onClick={() => navigate("/")}>Ignite</h1>
                        <div className="brand-info">
                            <h2>Administration</h2>
                            <p>Welcome back, {userName || "Admin"}</p>
                        </div>
                    </div>

                    <div className="user-profile-wrapper">
                        <button
                            className="theme-toggle-btn"
                            onClick={toggleTheme}
                            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                            style={{
                                background: 'var(--gray-100)',
                                border: 'none',
                                borderRadius: 'var(--radius-lg)',
                                padding: '0.6rem',
                                color: 'var(--gray-600)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'var(--transition)',
                                marginRight: '1rem'
                            }}
                        >
                            {isDarkMode ? <RiSunLine /> : <RiMoonLine />}
                        </button>
                        <button
                            className={`profile-trigger ${isDropdownOpen ? 'active' : ''}`}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <div className="profile-img-container">
                                {imageUrl ? (
                                    <img src={getImageUrl(imageUrl)} alt={userName} className="nav-avatar-img" />
                                ) : (
                                    <RiUserFill />
                                )}
                            </div>
                            <div className="profile-text-info">
                                <span className="user-displayName">{userName || "Admin"}</span>
                                <span className="user-displayRole">{userRole || "Super Admin"}</span>
                            </div>
                        </button>

                        {isDropdownOpen && (
                            <div className="navbar-dropdown">
                                <div className="dropdown-user-header">
                                    <p className="user-name-bold">{userName || "Admin"}</p>
                                    <p className="user-email-small">Admin Account</p>
                                </div>
                                <div className="dropdown-sep"></div>
                                <button
                                    className="dropdown-nav-item"
                                    onClick={() => {
                                        navigate("/adminprofilepage");
                                        setIsDropdownOpen(false);
                                    }}
                                >
                                    <RiUserLine />
                                    <span>My Profile</span>
                                </button>
                                <div className="dropdown-sep"></div>
                                <button
                                    className="dropdown-nav-item item-logout"
                                    onClick={() => {
                                        handleLogout();
                                        setIsDropdownOpen(false);
                                    }}
                                >
                                    <RiLogoutBoxLine />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <nav className="navbar-navigation">
                    <NavLink to="/admindashboard" end className={({ isActive }) => (isActive ? "nav-tab-link active" : "nav-tab-link")}>
                        <RiDashboardLine /> <span>Overview</span>
                    </NavLink>
                    <NavLink to="/eventshandal" className={({ isActive }) => (isActive ? "nav-tab-link active" : "nav-tab-link")}>
                        <RiCalendarEventLine /> <span>Events</span>
                    </NavLink>
                    <NavLink to="/userpage" className={({ isActive }) => (isActive ? "nav-tab-link active" : "nav-tab-link")}>
                        <RiUserLine /> <span>Users</span>
                    </NavLink>
                    <NavLink to="/notifications" className={({ isActive }) => (isActive ? "nav-tab-link active" : "nav-tab-link")}>
                        <RiBellLine /> <span>Notifications</span>
                    </NavLink>
                </nav>
            </div>
        </header>
    );
};

export default Admindasnav;
