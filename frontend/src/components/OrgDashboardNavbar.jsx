import React, { useState, useEffect, useContext, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./DashboardNavbar.css"; // Uses shared styling
import { getImageUrl } from "../utils/imageUrl";
import {
    RiUserFill,
    RiLogoutBoxLine,
    RiDashboardLine,
    RiUserLine,
    RiShieldCheckLine,
    RiBellLine,
    RiMoonLine,
    RiSunLine,
} from "react-icons/ri";
import { ThemeContext } from "../context/ThemeContext";
import { EventContext } from "../context/EventContext";
import { UserContext } from "../context/UserContext";

const OrgDashboardNavbar = ({ user, onLogout, onCreateEventClick }) => {
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useContext(ThemeContext);
    const { events } = useContext(EventContext);
    const { currentUser } = useContext(UserContext);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Compute notification count for org admin
    // Build a snapshot of the org's notification-relevant state
    const notifHash = useMemo(() => {
        if (!events || !currentUser) return '';
        const createdIds = [];
        let totalParticipants = 0;
        events.forEach(event => {
            const isCreator = event.createdBy && (event.createdBy._id || event.createdBy).toString() === currentUser._id?.toString();
            if (isCreator) {
                createdIds.push(event._id);
                totalParticipants += event.participants?.length || 0;
            }
        });
        return `${createdIds.sort().join(',')}_${totalParticipants}_${events.length}`;
    }, [events, currentUser]);

    // Show dot if event state changed since last notifications visit
    const hasNewNotifs = useMemo(() => {
        if (!currentUser) return false;
        const lastHash = localStorage.getItem(`notifHash_${currentUser._id}`);
        if (!lastHash) return true; // Never visited — show dot
        return notifHash !== lastHash && notifHash !== '';
    }, [notifHash, currentUser]);

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

    const userName = user?.name || "Organization";

    return (
        <header className="navbar-header">
            <div className="navbar-container">
                <div className="navbar-top">
                    <div className="logo-section">
                        <h1 className="brand-logo" onClick={() => navigate("/")}>Ignite</h1>
                        <div className="brand-info">
                            <h2>Organization</h2>
                            <p>Welcome back, {userName}</p>
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
                                {user?.imageUrl ? (
                                    <img src={getImageUrl(user.imageUrl)} alt={userName} className="nav-avatar-img" />
                                ) : (
                                    <RiUserFill />
                                )}
                            </div>
                            <div className="profile-text-info">
                                <span className="user-displayName">{userName}</span>
                                <span className="user-displayRole">
                                    Organization {user?.isVerified && <RiShieldCheckLine style={{ color: '#10b981', fontSize: '0.875rem', marginLeft: '4px' }} />}
                                </span>
                            </div>
                        </button>

                        {isDropdownOpen && (
                            <div className="navbar-dropdown">
                                <div className="dropdown-user-header">
                                    <p className="user-name-bold">{userName}</p>
                                    <p className="user-email-small">{user?.email}</p>
                                </div>
                                <div className="dropdown-sep"></div>
                                <button
                                    className="dropdown-nav-item"
                                    onClick={() => {
                                        navigate("/profilepage");
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
                    <NavLink to="/org-dashboard" end className={({ isActive }) => (isActive ? "nav-tab-link active" : "nav-tab-link")}>
                        <RiDashboardLine /> <span>My Events</span>
                    </NavLink>
                    <NavLink to="/notifications" className={({ isActive }) => (isActive ? "nav-tab-link active" : "nav-tab-link")}>
                        <span className="nav-icon-wrapper">
                            <RiBellLine />
                            {hasNewNotifs && <span className="notif-dot"></span>}
                        </span>
                        <span>Notifications</span>
                    </NavLink>
                    <NavLink to="/profilepage" className={({ isActive }) => (isActive ? "nav-tab-link active" : "nav-tab-link")}>
                        <RiUserLine /> <span>Profile</span>
                    </NavLink>
                </nav>
            </div>
        </header>
    );
};

export default OrgDashboardNavbar;
