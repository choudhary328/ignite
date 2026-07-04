import React, { useState, useEffect, useContext, useRef } from "react";
import DashboardNavbar from "../components/DashboardNavbar";
import EventCard from "./EventCard";
import { UserContext } from "../context/UserContext";
import { RiSearchLine, RiArrowDownSLine, RiFilter3Line, RiArrowUpDownLine } from "react-icons/ri";
import "./DiscoverEvents.css";

// --- Reusable FilterPill Component ---
const FilterPill = ({ label, value, defaultValue, options, onChange, onClear }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pillRef = useRef(null);
  const isActive = value !== defaultValue;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pillRef.current && !pillRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`filter-pill-wrapper ${isOpen ? 'open' : ''}`} ref={pillRef}>
      <button
        className={`filter-pill ${isActive ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <RiArrowDownSLine className="pill-chevron" />
        <span>{label}</span>
        {isActive && <span className="pill-badge">1</span>}
      </button>

      {isOpen && (
        <div className="pill-dropdown">
          <div className="pill-dropdown-header">
            <span className="pill-dropdown-title">{label}</span>
            {isActive && (
              <button className="pill-clear-btn" onClick={() => { onClear(); setIsOpen(false); }}>
                Clear
              </button>
            )}
          </div>
          <div className="pill-dropdown-options">
            {options.map((opt) => (
              <label key={opt.value} className="pill-option">
                <input
                  type="radio"
                  name={label}
                  checked={value === opt.value}
                  onChange={() => { onChange(opt.value); setIsOpen(false); }}
                />
                <span className="pill-radio-circle"></span>
                <span className="pill-option-label">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const DiscoverEvents = ({ onLogout }) => {
  const { currentUser } = useContext(UserContext);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filter, setFilter] = useState("");
  const [category, setCategory] = useState("All");
  const [locationFilter, setLocationFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [orgFilter, setOrgFilter] = useState("");
  const [modeFilter, setModeFilter] = useState("All");
  const [viewMode, setViewMode] = useState("grid");

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:5000/api/events");
      if (!response.ok) {
        throw new Error("Failed to fetch events.");
      }
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    const keyword = filter.toLowerCase();
    const matchesKeyword = (event.title?.toLowerCase().includes(keyword) ||
      event.description?.toLowerCase().includes(keyword) ||
      event.createdBy?.name?.toLowerCase().includes(keyword));
    const matchesCategory = category === 'All' || event.category === category;
    const matchesLocation = !locationFilter || event.location?.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesOrg = !orgFilter || (event.createdBy?.name?.toLowerCase().includes(orgFilter.toLowerCase()));

    let matchesDate = true;
    if (dateFilter) {
      const eventDate = new Date(event.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dateFilter === 'upcoming') matchesDate = eventDate >= today;
      else if (dateFilter === 'past') matchesDate = eventDate < today;
      else if (dateFilter === 'today') matchesDate = eventDate.toDateString() === today.toDateString();
    }

    const matchesMode = modeFilter === 'All' || (event.mode || 'Offline') === modeFilter;

    return matchesKeyword && matchesCategory && matchesLocation && matchesOrg && matchesDate && matchesMode;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingEvents = filteredEvents.filter(event => new Date(event.date) >= today);
  const pastEvents = filteredEvents.filter(event => new Date(event.date) < today);

  // Count active filters
  const activeFilterCount = [
    category !== 'All',
    dateFilter !== '',
    modeFilter !== 'All',
    locationFilter !== '',
    orgFilter !== '',
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setCategory("All");
    setDateFilter("");
    setModeFilter("All");
    setLocationFilter("");
    setOrgFilter("");
    setFilter("");
  };

  return (
    <div className="discover-page">
      <DashboardNavbar
        user={currentUser}
        onLogout={onLogout}
      />
      <main className="discover-main">
        <div className="discover-header">
          <h1>Discover Events</h1>
          <p>Find and join exciting events in your community</p>
        </div>

        {/* --- Search Bar --- */}
        <div className="discover-search-bar">
          <RiSearchLine className="discover-search-icon" />
          <input
            type="text"
            placeholder="Search events by name or description..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        {/* --- Pill Filters Row --- */}
        <div className="filter-pills-row">
          {/* Combined Filters Pill (shows total active count) */}
          <div className={`filter-pill-static ${activeFilterCount > 0 ? 'active' : ''}`}>
            <RiFilter3Line />
            <span>Filters</span>
            {activeFilterCount > 0 && <span className="pill-badge">{activeFilterCount}</span>}
            {activeFilterCount > 0 && (
              <button className="pill-clear-inline" onClick={clearAllFilters}>✕</button>
            )}
          </div>

          <FilterPill
            label="Category"
            value={category}
            defaultValue="All"
            options={[
              { value: "All", label: "All Categories" },
              { value: "Technology", label: "Technology" },
              { value: "Business", label: "Business" },
              { value: "Entertainment", label: "Entertainment" },
            ]}
            onChange={setCategory}
            onClear={() => setCategory("All")}
          />

          <FilterPill
            label="Timeline"
            value={dateFilter}
            defaultValue=""
            options={[
              { value: "", label: "Any Date" },
              { value: "upcoming", label: "Upcoming" },
              { value: "today", label: "Today" },
              { value: "past", label: "Past" },
            ]}
            onChange={setDateFilter}
            onClear={() => setDateFilter("")}
          />

          <FilterPill
            label="Mode"
            value={modeFilter}
            defaultValue="All"
            options={[
              { value: "All", label: "All Modes" },
              { value: "Offline", label: "Offline" },
              { value: "Online", label: "Online" },
            ]}
            onChange={setModeFilter}
            onClear={() => setModeFilter("All")}
          />

          {/* Sort / View Toggle */}
          <div className="filter-pill-wrapper">
            <button
              className="filter-pill sort-pill"
              onClick={() => setViewMode(viewMode === 'grid' ? 'grouped' : 'grid')}
            >
              <RiArrowUpDownLine />
              <span>{viewMode === 'grid' ? 'All Events' : 'By Organization'}</span>
            </button>
          </div>
        </div>


        <div className="discover-content">
          {isLoading && <p>Loading events...</p>}
          {error && <p>Error: {error}</p>}

          {!isLoading && !error && filteredEvents.length === 0 && (
            <div className="no-events-found">
              <div className="no-events-icon">📅</div>
              <h3>No events found</h3>
              <p>Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          )}

          {!isLoading && !error && viewMode === 'grid' && (
            <div className="grid-view-container">
              {upcomingEvents.length > 0 && (
                <div className="events-group">
                  <h2 className="section-title">Upcoming Events</h2>
                  <div className="discover-grid">
                    {upcomingEvents.map(event => (
                      <EventCard
                        key={event._id}
                        event={event}
                        onEventUpdate={fetchEvents}
                      />
                    ))}
                  </div>
                </div>
              )}

              {pastEvents.length > 0 && (
                <div className="events-group past-events-group">
                  <h2 className="section-title">Past Events</h2>
                  <div className="discover-grid">
                    {pastEvents.map(event => (
                      <EventCard
                        key={event._id}
                        event={event}
                        onEventUpdate={fetchEvents}
                        isPast={true}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!isLoading && !error && viewMode === 'grouped' && (
            <div className="grouped-events-container">
              {Object.entries(filteredEvents.reduce((acc, event) => {
                const orgName = event.createdBy?.name || "Other Organizations";
                if (!acc[orgName]) acc[orgName] = [];
                acc[orgName].push(event);
                return acc;
              }, {})).map(([orgName, orgEvents]) => (
                <div key={orgName} className="org-group-section">
                  <h2 className="org-group-title">{orgName}</h2>
                  <div className="discover-grid">
                    {orgEvents.map(event => (
                      <EventCard
                        key={event._id}
                        event={event}
                        onEventUpdate={fetchEvents}
                        isPast={new Date(event.date) < today}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DiscoverEvents;