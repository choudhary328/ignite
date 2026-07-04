import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import DashboardNavbar from "../components/DashboardNavbar";
import "./Dashboard.css";
import { UserContext } from "../context/UserContext";
import { EventContext } from "../context/EventContext"; // 1. Get Event Context
import { getImageUrl } from "../utils/imageUrl";
import {
  RiCalendarEventFill,
  RiCalendarCheckFill,
  RiCalendarScheduleFill,
  RiHistoryFill,
  RiStarLine,
  RiCalendarLine,
  RiCalendarScheduleLine,
  RiCalendarEventLine,
  RiRocketLine,
  RiSearchLine,
  RiBookmarkLine,
  RiUserSettingsLine,
  RiMapPinLine,
  RiGroupLine,
} from "react-icons/ri";

// --- Empty State Component ---
const EmptyState = ({ icon, text, buttonText, buttonLink }) => {
  return (
    <div className="card-body-empty">
      {icon}
      <p className="empty-text">{text}</p>
      {buttonText && buttonLink && (
        <Link to={buttonLink} className="empty-browse-btn">
          {buttonText}
        </Link>
      )}
    </div>
  );
};

// --- Dashboard Event Item (for "Your Upcoming Events") ---
const DashboardEventItem = ({ event, onEventUpdate }) => {
  const { _id, title, date, time, location } = event;
  const [isLoading, setIsLoading] = useState(false); // --- ADDED ---

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  // --- UPDATED: This component can now "Leave" an event ---
  const handleLeaveEvent = async () => {
    setIsLoading(true); // --- ADDED ---
    const token = localStorage.getItem("igniteUserToken") || sessionStorage.getItem("igniteUserToken");
    try {
      const response = await fetch(
        `http://localhost:5000/api/events/${_id}/leave`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to leave event.");
      if (onEventUpdate) onEventUpdate(); // Trigger global refresh
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false); // --- ADDED ---
    }
  };

  return (
    <div className="dashboard-event-item-compact">
      <img
        src={
          getImageUrl(event.imageUrl, `https://placehold.co/100x100/eef2ff/4f46e5?text=${event.title.charAt(
            0
          )}`)
        }
        alt={event.title}
        className="event-item-image-compact"
      />
      <div className="event-item-details-compact">
        <h4 className="event-item-title-compact">{title}</h4>
        <div className="event-item-meta-compact">
          <span>
            <RiCalendarLine /> {formattedDate} • {time}
          </span>
          <span>
            <RiMapPinLine /> {location}
          </span>
        </div>
      </div>
      {/* --- UPDATED: Changed from <Link> to <button> --- */}
      <button
        className="event-item-join-btn compact-leave"
        onClick={handleLeaveEvent}
        disabled={isLoading}
      >
        {isLoading ? "Leaving..." : "Leave"}
      </button>
    </div>
  );
};

// --- Dashboard Event Item (for "Recommended Events") ---
const DashboardRecommendedItem = ({ event, onEventJoined }) => {
  const {
    _id,
    title,
    date,
    time,
    location,
    category,
    participants,
    maxParticipants,
    imageUrl,
  } = event;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isJoined, setIsJoined] = useState(false); // This component assumes isJoined is false

  const participantCount = participants?.length || 0;

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const handleJoinEvent = async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem("igniteUserToken") || sessionStorage.getItem("igniteUserToken");

    try {
      const response = await fetch(
        `http://localhost:5000/api/events/${_id}/join`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to join event.");
      }

      setIsJoined(true); // Visually update this item
      if (onEventJoined) {
        onEventJoined(); // Trigger global refresh
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isFull = participantCount >= maxParticipants;

  return (
    <div className="dashboard-event-item">
      <img
        src={
          getImageUrl(imageUrl, `https://placehold.co/100x100/eef2ff/4f46e5?text=${title.charAt(0)}`)
        }
        alt={title}
        className="event-item-image"
      />
      <div className="event-item-details">
        <h4 className="event-item-title">{title}</h4>
        <div className="event-item-meta">
          <span>
            <RiCalendarLine /> {formattedDate} • {time}
          </span>
          <span>
            <RiMapPinLine /> {location}
          </span>
          <span>
            <RiGroupLine /> {participantCount} / {maxParticipants} joined
          </span>
        </div>
      </div>
      <div className="event-item-actions">
        <span className="event-item-category">{category}</span>

        {error && <p className="event-card-error">{error}</p>}
        <button
          className={`event-item-join-btn ${isJoined ? "btn-joined" : ""} ${isFull ? "btn-disabled" : ""
            }`}
          onClick={handleJoinEvent}
          disabled={isLoading || isJoined || isFull}
        >
          {isLoading
            ? "Joining..."
            : isJoined
              ? "Joined"
              : isFull
                ? "Event Full"
                : "Join"}
        </button>
      </div>
    </div>
  );
};

// --- Main Dashboard Component ---
const Dashboard = ({ onLogout }) => {
  const { currentUser } = useContext(UserContext);
  // 2. Get all data from the global context
  const { events, isLoading, error, refetchEvents } = useContext(EventContext);

  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [myUpcomingEvents, setMyUpcomingEvents] = useState([]);
  const [stats, setStats] = useState({
    joined: 0,
    upcoming: 0,
    available: 0,
    past: 0,
  });

  // 3. Use useEffect to filter the global event list
  useEffect(() => {
    if (!currentUser || !events) return; // Wait for data

    const now = new Date();
    const allUpcoming = events.filter(
      (event) => new Date(event.date) > now
    );
    const allPast = events.filter(
      (event) => new Date(event.date) <= now
    );

    // --- FIX: Robust check for participant ID ---
    const myJoinedEvents = allUpcoming.filter(
      (event) =>
        event.participants &&
        event.participants.some(p => (p.user?._id || p.user || p).toString() === currentUser._id.toString())
    );

    const notJoinedEvents = allUpcoming.filter(
      (event) =>
        !event.participants ||
        !event.participants.some(p => (p.user?._id || p.user || p).toString() === currentUser._id.toString())
    );
    // --- END FIX ---

    // --- FIX: Calculate Total Joined (Past + Upcoming) ---
    const allJoinedEvents = events.filter(
      (event) =>
        event.participants &&
        event.participants.some(p => (p.user?._id || p.user || p).toString() === currentUser._id.toString())
    );

    setMyUpcomingEvents(myJoinedEvents);
    setRecommendedEvents(notJoinedEvents);

    setStats({
      joined: allJoinedEvents.length, // Total Joined
      upcoming: allUpcoming.length,   // Global Upcoming
      available: events.length,       // Total Events
      past: allPast.length,           // Global Past
    });
    // --- END FIX ---
  }, [events, currentUser]); // Re-filter when global events or user change

  // --- Helper to render event lists ---
  const renderRecommendedList = () => {
    if (isLoading) return <p className="card-body">Loading events...</p>;
    if (error)
      return <p className="card-body-empty empty-text">Error: {error}</p>;
    if (recommendedEvents.length === 0) {
      return (
        <EmptyState
          icon={<RiCalendarEventLine className="empty-icon" />}
          text="No available events at the moment"
        />
      );
    }
    return (
      <div className="dashboard-event-list">
        {recommendedEvents.slice(0, 3).map((event) => (
          <DashboardRecommendedItem
            key={event._id}
            event={event}
            onEventJoined={refetchEvents} // 4. Pass the global refetch function
          />
        ))}
      </div>
    );
  };

  const renderUpcomingList = () => {
    if (isLoading) return <p className="card-body">Loading events...</p>;

    if (myUpcomingEvents.length === 0) {
      return (
        <EmptyState
          icon={<RiCalendarLine className="empty-icon" />}
          text="No upcoming events"
          buttonText="Browse Events"
          buttonLink="/discover"
        />
      );
    }
    return (
      <div className="dashboard-event-list-compact">
        {myUpcomingEvents.slice(0, 3).map((event) => (
          <DashboardEventItem
            key={event._id}
            event={event}
            onEventUpdate={refetchEvents} // 4. Pass the global refetch function
          />
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard-page">
      <DashboardNavbar
        user={currentUser}
        onLogout={onLogout}
      />

      <main className="dashboard-content-area">
        {/* --- Welcome Banner --- */}
        <div className="welcome-banner">
          <div className="banner-text">
            <h1 className="banner-title">
              Welcome back, {currentUser?.name || "User"}!
            </h1>
            <p className="banner-subtitle">
              Ready to discover amazing events?
            </p>
          </div>
          <div className="banner-icon">
            <RiCalendarEventFill />
          </div>
        </div>

        {/* --- Stats Grid (Now with live data) --- */}
        <div className="dashboard-stats-grid">
          <div className="dashboard-stat-item">
            <div className="stat-icon blue">
              <RiCalendarCheckFill />
            </div>
            <div className="stat-info">
              <span className="stat-title">Events Joined</span>
              <span className="stat-value">{stats.joined}</span>
            </div>
          </div>
          <div className="dashboard-stat-item">
            <div className="stat-icon green">
              <RiCalendarScheduleFill />
            </div>
            <div className="stat-info">
              <span className="stat-title">Upcoming Events</span>
              <span className="stat-value">{stats.upcoming}</span>
            </div>
          </div>
          <div className="dashboard-stat-item">
            <div className="stat-icon purple">
              <RiCalendarEventFill />
            </div>
            <div className="stat-info">
              <span className="stat-title">Available Events</span>
              <span className="stat-value">{stats.available}</span>
            </div>
          </div>
          <div className="dashboard-stat-item">
            <div className="stat-icon gray">
              <RiHistoryFill />
            </div>
            <div className="stat-info">
              <span className="stat-title">Past Events</span>
              <span className="stat-value">{stats.past}</span>
            </div>
          </div>
        </div>

        {/* --- Events Section --- */}
        <div className="events-section">
          {/* "Your Upcoming Events" Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <RiCalendarScheduleLine /> Your Upcoming Events
              </h3>
              <Link to="/my-events" className="card-view-all">
                View All
              </Link>
            </div>
            {renderUpcomingList()}
          </div>

          {/* "Recommended Events" Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <RiStarLine /> Recommended Events
              </h3>
              <Link to="/discover" className="card-view-all">
                View All
              </Link>
            </div>
            {renderRecommendedList()}
          </div>
        </div>

        {/* --- Quick Actions --- */}
        <div className="card quick-actions-panel">
          <div className="card-header">
            <h3 className="card-title">
              <RiRocketLine /> Quick Actions
            </h3>
          </div>
          <div className="card-body">
            <div className="quick-actions-grid">
              <Link to="/discover" className="quick-action-item blue">
                <div className="quick-action-icon blue">
                  <RiSearchLine />
                </div>
                <div className="quick-action-text">
                  <span className="quick-action-title">Browse Events</span>
                  <span className="quick-action-subtitle">
                    Discover new events
                  </span>
                </div>
              </Link>
              <Link to="/my-events" className="quick-action-item green">
                <div className="quick-action-icon green">
                  <RiBookmarkLine />
                </div>
                <div className="quick-action-text">
                  <span className="quick-action-title">My Events</span>
                  <span className="quick-action-subtitle">
                    View joined events
                  </span>
                </div>
              </Link>
              <Link to="/profilepage" className="quick-action-item purple">
                <div className="quick-action-icon purple">
                  <RiUserSettingsLine />
                </div>
                <div className="quick-action-text">
                  <span className="quick-action-title">Edit Profile</span>
                  <span className="quick-action-subtitle">
                    Update your information
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;