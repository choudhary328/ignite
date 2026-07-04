import React, { useState, useEffect, useContext } from "react";
import DashboardNavbar from "../components/DashboardNavbar";
import { UserContext } from "../context/UserContext";
import { EventContext } from "../context/EventContext"; // 1. Get Event Context
import { Link } from "react-router-dom";
import EventCard from "./EventCard";
import {
  RiBookmarkLine, // --- NEW: Added for empty state ---
} from "react-icons/ri";
import "./MyEventsPage.css"; // Uses the CSS file you provided



// --- Main Page Component ---
const MyEventsPage = ({ onLogout }) => {
  const { currentUser } = useContext(UserContext);
  // 2. Get all data from the global context
  const { events, isLoading, error, refetchEvents } = useContext(EventContext);

  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  // --- REMOVED: Local isLoading and error state ---

  // --- REMOVED: fetchMyEvents (now handled by context) ---

  // Refetch events every time this page is visited
  useEffect(() => {
    refetchEvents();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 3. Use useEffect to filter the global event list
  useEffect(() => {
    if (!currentUser || !events) return; // Wait for data

    // --- FIX: Robust check for participant ID ---
    const joinedEvents = events.filter(
      (event) =>
        event.participants &&
        event.participants.some(p => (p.user?._id || p.user || p).toString() === currentUser._id.toString())
    );
    // --- END FIX ---

    // Split events into upcoming and past
    const now = new Date();
    const upcoming = joinedEvents.filter(event => new Date(event.date) > now);
    const past = joinedEvents.filter(event => new Date(event.date) <= now);

    setUpcomingEvents(upcoming);
    setPastEvents(past);

  }, [events, currentUser]); // Re-filter when global events or user change

  const totalEventsJoined = upcomingEvents.length + pastEvents.length;

  // Helper function to render the main content
  const renderContent = () => {
    if (isLoading) {
      return <p>Loading your events...</p>; // Use global loading state
    }

    if (error) {
      return <p>Error: {error}</p>; // Use global error state
    }

    // Show empty state if NO events are joined at all
    if (upcomingEvents.length === 0 && pastEvents.length === 0) {
      return (
        <div className="my-events-empty-state">
          <RiBookmarkLine className="empty-state-icon" />
          <h2>No events joined yet</h2>
          <p>Start browsing events to join your first one!</p>
          <Link to="/discover" className="empty-state-btn">
            Browse Events
          </Link>
        </div>
      );
    }

    return (
      <div className="my-events-content-grid">
        {/* --- Upcoming Events Section --- */}
        <div className="events-group">
          <h2 className="section-title">Upcoming Events</h2>
          {upcomingEvents.length === 0 ? (
            <p className="list-empty-text">You have no upcoming events.</p>
          ) : (
            <div className="my-events-grid">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onEventUpdate={refetchEvents}
                  showLeaveButton={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* --- Past Events Section --- */}
        <div className="events-group past-events-group">
          <h2 className="section-title">Past Events</h2>
          {pastEvents.length === 0 ? (
            <p className="list-empty-text">You have no past events.</p>
          ) : (
            <div className="my-events-grid">
              {pastEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onEventUpdate={refetchEvents}
                  isPast={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="my-events-page">
      <DashboardNavbar
        user={currentUser}
        onLogout={onLogout}
      />
      <main className="my-events-main">
        <div className="my-events-header">
          <h1>My Events</h1>
          <span>{totalEventsJoined} events joined</span>
        </div>

        {/* --- Render content or empty state --- */}
        {renderContent()}

      </main>
    </div>
  );
};

export default MyEventsPage;