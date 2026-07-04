import React, { useState, useEffect, useContext } from "react";
import DashboardNavbar from "../components/DashboardNavbar";
import OrgDashboardNavbar from "../components/OrgDashboardNavbar";
import Admindasnav from "../components/Admindasnav";
import { UserContext } from "../context/UserContext";
import { EventContext } from "../context/EventContext";
import {
    RiBellLine,
    RiCheckDoubleLine,
    RiCalendarEventLine,
    RiTeamFill,
    RiTimeLine,
    RiSparklingFill,
    RiDeleteBinLine,
    RiCheckboxCircleFill,
    RiAlertLine,
    RiFireLine,
    RiBuildingLine,
} from "react-icons/ri";
import "./NotificationsPage.css";

// --- Generate notifications from events data ---
const generateNotifications = (events, users, currentUser) => {
    if (!events || !currentUser) return [];

    const notifications = [];
    const now = new Date();

    events.forEach((event) => {
        const eventDate = new Date(event.date);
        const timeDiff = eventDate - now;
        const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        const isParticipant =
            event.participants &&
            event.participants.some(
                (p) => (p.user?._id || p.user || p).toString() === currentUser._id.toString()
            );

        const isCreator =
            event.createdBy &&
            (event.createdBy._id || event.createdBy).toString() ===
            currentUser._id.toString();

        const isSuperAdmin = currentUser.role === "super_admin";

        // --- Notifications for events you've joined ---
        if (isParticipant) {
            // Event is tomorrow
            if (daysUntil === 1) {
                notifications.push({
                    id: `tomorrow-${event._id}`,
                    type: "urgent",
                    icon: <RiFireLine />,
                    title: "Event Tomorrow!",
                    message: `"${event.title}" is happening tomorrow. Don't forget to attend!`,
                    time: "Tomorrow",
                    eventId: event._id,
                    priority: 1,
                    timestamp: new Date(eventDate.getTime() - 86400000),
                });
            }

            // Event is this week (2-7 days)
            if (daysUntil >= 2 && daysUntil <= 7) {
                notifications.push({
                    id: `upcoming-${event._id}`,
                    type: "reminder",
                    icon: <RiCalendarEventLine />,
                    title: "Upcoming Event",
                    message: `"${event.title}" is in ${daysUntil} days. Mark your calendar!`,
                    time: `In ${daysUntil} days`,
                    eventId: event._id,
                    priority: 2,
                    timestamp: new Date(now.getTime() - daysUntil * 3600000),
                });
            }

            // Successfully registered
            notifications.push({
                id: `registered-${event._id}`,
                type: "success",
                icon: <RiCheckboxCircleFill />,
                title: "Registration Confirmed",
                message: `You're registered for "${event.title}" on ${eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}.`,
                time: eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                eventId: event._id,
                priority: 3,
                timestamp: new Date(eventDate.getTime() - 7 * 86400000),
            });
        }

        // --- Notifications for events you've created ---
        if (isCreator) {
            // New participants
            const participantCount = event.participants ? event.participants.length : 0;
            if (participantCount > 0) {
                notifications.push({
                    id: `participants-${event._id}`,
                    type: "info",
                    icon: <RiTeamFill />,
                    title: "New Registrations",
                    message: `${participantCount} ${participantCount === 1 ? "person has" : "people have"} registered for "${event.title}".`,
                    time: "Recent",
                    eventId: event._id,
                    priority: 2,
                    timestamp: new Date(now.getTime() - 3600000),
                });
            }

            // Event status
            if (event.status === "approved") {
                notifications.push({
                    id: `approved-${event._id}`,
                    type: "success",
                    icon: <RiCheckboxCircleFill />,
                    title: "Event Approved",
                    message: `Your event "${event.title}" has been approved and is now live!`,
                    time: "Approved",
                    eventId: event._id,
                    priority: 2,
                    timestamp: new Date(now.getTime() - 7200000),
                });
            } else if (event.status === "pending") {
                notifications.push({
                    id: `pending-${event._id}`,
                    type: "warning",
                    icon: <RiTimeLine />,
                    title: "Pending Approval",
                    message: `Your event "${event.title}" is pending admin approval.`,
                    time: "Waiting",
                    eventId: event._id,
                    priority: 3,
                    timestamp: new Date(now.getTime() - 14400000),
                });
            } else if (event.status === "rejected") {
                notifications.push({
                    id: `rejected-${event._id}`,
                    type: "urgent",
                    icon: <RiAlertLine />,
                    title: "Event Rejected",
                    message: `Your event "${event.title}" was not approved. Please review and resubmit.`,
                    time: "Action needed",
                    eventId: event._id,
                    priority: 1,
                    timestamp: new Date(now.getTime() - 28800000),
                });
            }

            // Event is approaching (creator reminder)
            if (daysUntil >= 1 && daysUntil <= 3) {
                notifications.push({
                    id: `creator-soon-${event._id}`,
                    type: "reminder",
                    icon: <RiSparklingFill />,
                    title: "Your Event is Coming Up",
                    message: `"${event.title}" is in ${daysUntil} day${daysUntil > 1 ? "s" : ""}. Make sure everything is ready!`,
                    time: `In ${daysUntil} day${daysUntil > 1 ? "s" : ""}`,
                    eventId: event._id,
                    priority: 1,
                    timestamp: new Date(now.getTime() - 1800000),
                });
            }
        }

        // --- Notifications for Super Admin ---
        if (isSuperAdmin) {
            // Events pending approval
            if (event.status === "pending") {
                notifications.push({
                    id: `admin-pending-${event._id}`,
                    type: "urgent",
                    icon: <RiTimeLine />,
                    title: "Approval Required",
                    message: `"${event.title}" by ${event.createdBy?.name || "Unknown Org"} is waiting for your approval.`,
                    time: "New Request",
                    eventId: event._id,
                    priority: 1,
                    timestamp: new Date(event.createdAt || now),
                });
            }
        }
    });

    // --- New Organization Registrations for Super Admin ---
    if (currentUser.role === "super_admin" && users) {
        users.forEach((user) => {
            if (user.role === "org_admin") {
                const userCreated = new Date(user.createdAt);
                const isRecent = (now - userCreated) < (7 * 24 * 60 * 60 * 1000); // 7 days

                if (isRecent) {
                    notifications.push({
                        id: `new-org-${user._id}`,
                        type: "info",
                        icon: <RiBuildingLine />,
                        title: "New Organization",
                        message: `${user.name} has registered as an organization.`,
                        time: userCreated.toLocaleDateString(),
                        priority: 3, // Lower priority than urgent approvals
                        timestamp: userCreated,
                    });
                }
            }
        });
    }

    // Welcome notification
    notifications.push({
        id: "welcome",
        type: "info",
        icon: <RiBellLine />,
        title: "Welcome to Ignite!",
        message: `Welcome, ${currentUser.name}! Explore events and stay updated with your notifications here.`,
        time: "System",
        priority: 10,
        timestamp: new Date(currentUser.createdAt || now),
    });

    // Sort by priority first, then by timestamp (newest first)
    notifications.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return b.timestamp - a.timestamp;
    });

    return notifications;
};

// --- Notification Card Component ---
const NotificationCard = ({ notification, onDismiss }) => {
    return (
        <div className={`notification-card notification-${notification.type}`}>
            <div className="notification-icon-wrapper">
                <span className={`notification-icon notification-icon-${notification.type}`}>
                    {notification.icon}
                </span>
            </div>
            <div className="notification-content">
                <div className="notification-header">
                    <h4 className="notification-title">{notification.title}</h4>
                    <span className="notification-time">{notification.time}</span>
                </div>
                <p className="notification-message">{notification.message}</p>
            </div>
            {onDismiss && (
                <button
                    className="notification-dismiss"
                    onClick={() => onDismiss(notification.id)}
                    title="Dismiss"
                >
                    <RiDeleteBinLine />
                </button>
            )}
        </div>
    );
};

// --- Main Notifications Page ---
const NotificationsPage = ({ onLogout }) => {
    const { currentUser } = useContext(UserContext);
    const { events, refetchEvents } = useContext(EventContext);
    const [notifications, setNotifications] = useState([]);
    const [users, setUsers] = useState([]);
    const [dismissed, setDismissed] = useState([]);
    const [filterType, setFilterType] = useState("all");

    useEffect(() => {
        refetchEvents();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Fetch users if super admin to show registration notifications
    useEffect(() => {
        if (currentUser?.role === "super_admin") {
            const fetchUsers = async () => {
                try {
                    const token = localStorage.getItem("igniteUserToken") || sessionStorage.getItem("igniteUserToken");
                    const response = await fetch("http://localhost:5000/api/users", {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setUsers(data);
                    }
                } catch (err) {
                    console.error("Failed to fetch users for notifications:", err);
                }
            };
            fetchUsers();
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser && events) {
            const generated = generateNotifications(events, users, currentUser);
            setNotifications(generated);
            // Mark notifications as seen — save hash matching what navbar computes
            let hash = '';
            if (currentUser.role === 'org_admin') {
                // Org admin: hash by created events + participant counts
                const createdIds = [];
                let totalParticipants = 0;
                events.forEach(event => {
                    const isCreator = event.createdBy && (event.createdBy._id || event.createdBy).toString() === currentUser._id.toString();
                    if (isCreator) {
                        createdIds.push(event._id);
                        totalParticipants += event.participants?.length || 0;
                    }
                });
                hash = `${createdIds.sort().join(',')}_${totalParticipants}_${events.length}`;
            } else {
                // Student / other: hash by joined events
                const joinedIds = [];
                events.forEach(event => {
                    const isParticipant = event.participants?.some(
                        p => (p.user?._id || p.user || p).toString() === currentUser._id.toString()
                    );
                    if (isParticipant) joinedIds.push(event._id);
                });
                hash = `${joinedIds.sort().join(',')}_${events.length}`;
            }
            localStorage.setItem(`notifHash_${currentUser._id}`, hash);
        }
    }, [events, users, currentUser]);

    const handleDismiss = (id) => {
        setDismissed((prev) => [...prev, id]);
    };

    const handleClearAll = () => {
        setDismissed(notifications.map((n) => n.id));
    };

    const visibleNotifications = notifications.filter(
        (n) => !dismissed.includes(n.id)
    );

    const filteredNotifications =
        filterType === "all"
            ? visibleNotifications
            : visibleNotifications.filter((n) => n.type === filterType);

    const filterCounts = {
        all: visibleNotifications.length,
        urgent: visibleNotifications.filter((n) => n.type === "urgent").length,
        success: visibleNotifications.filter((n) => n.type === "success").length,
        reminder: visibleNotifications.filter((n) => n.type === "reminder").length,
        info: visibleNotifications.filter((n) => n.type === "info").length,
        warning: visibleNotifications.filter((n) => n.type === "warning").length,
    };

    const isSuperAdmin = currentUser?.role === "super_admin";
    const isOrgAdmin = currentUser?.role === "org_admin";

    return (
        <div className="notifications-page">
            {isSuperAdmin ? (
                <Admindasnav
                    userName={currentUser?.name}
                    userRole="Super Admin"
                    imageUrl={currentUser?.imageUrl}
                    onLogout={onLogout}
                />
            ) : isOrgAdmin ? (
                <OrgDashboardNavbar user={currentUser} onLogout={onLogout} />
            ) : (
                <DashboardNavbar user={currentUser} onLogout={onLogout} />
            )}

            <main className="notifications-main">
                {/* Header */}
                <div className="notifications-page-header">
                    <div className="notifications-header-left">
                        <h1 className="notifications-page-title">
                            <RiBellLine /> Notifications
                        </h1>
                        <span className="notifications-count-badge">
                            {visibleNotifications.length}
                        </span>
                    </div>
                    {visibleNotifications.length > 0 && (
                        <button className="notifications-clear-all" onClick={handleClearAll}>
                            <RiCheckDoubleLine /> Mark All Read
                        </button>
                    )}
                </div>

                {/* Filter Pills */}
                <div className="notifications-filters">
                    {[
                        { key: "all", label: "All" },
                        { key: "urgent", label: "Urgent" },
                        { key: "success", label: "Confirmed" },
                        { key: "reminder", label: "Reminders" },
                        { key: "warning", label: "Pending" },
                        { key: "info", label: "Info" },
                    ].map((f) => (
                        <button
                            key={f.key}
                            className={`notif-filter-pill ${filterType === f.key ? "active" : ""} notif-pill-${f.key}`}
                            onClick={() => setFilterType(f.key)}
                        >
                            {f.label}
                            {filterCounts[f.key] > 0 && (
                                <span className="notif-pill-count">{filterCounts[f.key]}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Notification Cards */}
                <div className="notifications-list">
                    {filteredNotifications.length === 0 ? (
                        <div className="notifications-empty">
                            <RiCheckDoubleLine className="notifications-empty-icon" />
                            <h3>All Caught Up!</h3>
                            <p>You have no notifications right now. Check back later!</p>
                        </div>
                    ) : (
                        filteredNotifications.map((n) => (
                            <NotificationCard
                                key={n.id}
                                notification={n}
                                onDismiss={handleDismiss}
                            />
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

export default NotificationsPage;
