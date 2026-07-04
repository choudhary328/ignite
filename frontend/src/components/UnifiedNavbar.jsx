import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { getImageUrl } from "../utils/imageUrl";
import {
    RiUserFill,
    RiLogoutBoxLine,
    RiDashboardLine,
    RiCalendarEventLine,
    RiBookmarkLine,
    RiUserLine,
    RiAddLine,
    RiShieldCheckLine,
} from "react-icons/ri";

const UnifiedNavbar = ({
    user,
    onLogout,
    onCreateEventClick,
    disableCreateEvent = false
}) => {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Close dropdown when clicking outside
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

    const userRole = user?.role || "user";
    const userName = user?.name || "User";

    // Define links based on role
    const getLinks = () => {
        switch (userRole) {
            case "super_admin":
            case "admin":
                return [
                    { to: "/admindashboard", label: "Overview", icon: <RiDashboardLine />, end: true },
                    { to: "/eventshandal", label: "Events", icon: <RiCalendarEventLine /> },
                    { to: "/userpage", label: "Users", icon: <RiUserLine /> },
                ];
            case "org_admin":
                return [
                    { to: "/org-dashboard", label: "My Events", icon: <RiDashboardLine />, end: true },
                    { to: "/adminprofilepage", label: "Profile", icon: <RiUserLine /> },
                ];
            default: // student / guest
                return [
                    { to: "/dashboard", label: "Home", icon: <RiDashboardLine />, end: true },
                    { to: "/discover", label: "Browse", icon: <RiCalendarEventLine /> },
                    { to: "/my-events", label: "My Events", icon: <RiBookmarkLine /> },
                    { to: "/profilepage", label: "Profile", icon: <RiUserLine /> },
                ];
        }
    };

    const profileLink = (userRole === "org_admin" || userRole === "super_admin" || userRole === "admin")
        ? "/adminprofilepage"
        : "/profilepage";

    const adminSubTitle = () => {
        if (userRole === "super_admin" || userRole === "admin") return "Administration";
        if (userRole === "org_admin") return "Organization";
        return "Event Hub";
    };

    return (
        <header className="navbar-header">
            <div className="navbar-container">
                {/* Top Section */}
                <div className="navbar-top">
                    {/* Logo + Title */}
                    <div className="logo-section">
                        <h1 className="brand-logo" onClick={() => navigate("/")}>Ignite</h1>
                        <div className="brand-info">
                            <h2>{adminSubTitle()}</h2>
                            <p>Welcome back, {userName}</p>
                        </div>
                    </div>

                    {/* User Actions */}
                    <div className="user-profile-wrapper">
                        {/* Create Event Button (Visible for Org Admins on their dashboard) */}
                        {userRole === "org_admin" && onCreateEventClick && (
                            <button
                                className={`btn-create-event ${disableCreateEvent ? "disabled" : ""}`}
                                onClick={!disableCreateEvent ? onCreateEventClick : undefined}
                                disabled={disableCreateEvent}
                            >
                                <RiAddLine /> <span>Create Event</span>
                            </button>
                        )}

                        {/* Profile Button */}
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
                                    {userRole === "org_admin" ? "Organization" : userRole.replace("_", " ")}
                                    {user?.isVerified && userRole === "org_admin" && <RiShieldCheckLine className="verified-icon" />}
                                </span>
                            </div>
                        </button>

                        {/* Dropdown Menu */}
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
                                        navigate(profileLink);
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

                {/* Bottom Section: Navigation */}
                <nav className="navbar-navigation">
                    {getLinks().map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.end}
                            className={({ isActive }) => (isActive ? "nav-tab-link active" : "nav-tab-link")}
                        >
                            {link.icon}
                            <span>{link.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>
        </header>
    );
};

export default UnifiedNavbar;
