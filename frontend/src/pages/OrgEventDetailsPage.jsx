import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUrl';
import {
    RiCalendarEventLine,
    RiTimeLine,
    RiMapPinLine,
    RiGroupLine,
    RiArrowLeftLine,
    RiMailLine,
    RiPhoneLine,
    RiBuildingLine,
    RiCloseLine,
    RiCameraLine
} from 'react-icons/ri';
import OrgDashboardNavbar from '../components/OrgDashboardNavbar';
import DiscussionHub from '../components/DiscussionHub';
import { UserContext } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import './OrgEventDetailsPage.css'; // New styles

// --- User Detail Modal ---
const UserDetailModal = ({ isOpen, onClose, user }) => {
    if (!isOpen || !user) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box user-detail-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Participant Details</h2>
                    <button className="modal-close-btn" onClick={onClose}><RiCloseLine /></button>
                </div>
                <div className="modal-body user-detail-body">
                    <div className="user-detail-header">
                        <div className="user-initials-lg">
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="user-detail-name">{user.name}</h3>
                        <div className="user-detail-role-wrap">
                            <span className="user-role-badge">{user.role || 'User'}</span>
                        </div>
                    </div>

                    <div className="user-info-grid">
                        <div className="info-row">
                            <RiMailLine className="info-icon" />
                            <div>
                                <label className="info-label">Email</label>
                                <p className="info-value">{user.email}</p>
                            </div>
                        </div>
                        <div className="info-row">
                            <RiPhoneLine className="info-icon" />
                            <div>
                                <label className="info-label">Contact Number</label>
                                <p className="info-value">{user.contact || 'Not provided'}</p>
                            </div>
                        </div>
                        <div className="info-row">
                            <RiBuildingLine className="info-icon" />
                            <div>
                                <label className="info-label">College / Organization</label>
                                <p className="info-value">{user.college || 'Not provided'}</p>
                            </div>
                        </div>
                        <div className="info-row">
                            <RiMapPinLine className="info-icon" />
                            <div>
                                <label className="info-label">Address</label>
                                <p className="info-value">{user.address || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const OrgEventDetailsPage = ({ onLogout }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useContext(UserContext);
    const toast = useToast();

    const [event, setEvent] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal State
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchEventDetails = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem("igniteUserToken") || sessionStorage.getItem("igniteUserToken");

                const eventRes = await fetch(`http://localhost:5000/api/events/${id}`);
                if (!eventRes.ok) throw new Error("Failed to fetch event.");
                const eventData = await eventRes.json();
                setEvent(eventData);

                const partRes = await fetch(`http://localhost:5000/api/events/${id}/participants`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (partRes.ok) {
                    const partData = await partRes.json();
                    setParticipants(partData);
                } else {
                    if (partRes.status === 401) setError("You are not authorized to view participants for this event.");
                }

            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (currentUser) {
            fetchEventDetails();
        }
    }, [id, currentUser]);

    const handleUserClick = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleManualCheckIn = async (userId, e) => {
        e.stopPropagation(); // Prevent opening the detail modal
        const token = localStorage.getItem("igniteUserToken") || sessionStorage.getItem("igniteUserToken");
        try {
            const response = await fetch(`http://localhost:5000/api/events/${id}/checkin`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userId }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Check-in failed');

            // Update local state
            setParticipants(prev => prev.map(p =>
                p._id === userId ? { ...p, status: 'Attended' } : p
            ));

            // Also update event object if needed
            setEvent(prev => ({
                ...prev,
                participants: prev.participants.map(p =>
                    (p.user?._id || p.user) === userId ? { ...p, status: 'Attended' } : p
                )
            }));

            toast.success("Check-in successful! ✅");
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (isLoading) return <div className="loading-screen">Loading Event Details...</div>;
    if (!event) return <div className="error-screen">Event not found.</div>;

    const isUpcoming = new Date(event.date) > new Date();

    return (
        <div className="dashboard-page">
            <OrgDashboardNavbar user={currentUser} onLogout={onLogout} />

            <main className="dashboard-content-area">
                <button className="btn-outline" onClick={() => navigate(-1)} style={{ marginBottom: '1rem', border: 'none', paddingLeft: 0 }}>
                    <RiArrowLeftLine /> Back to Dashboard
                </button>

                {error && <div className="event-card-error">{error}</div>}

                {/* Hero Section */}
                <div className="event-details-hero">
                    <div className="event-details-header-content">
                        <h1>{event.title}</h1>
                        <div className="event-meta-row">
                            <div className="event-meta-item">
                                <RiCalendarEventLine /> {new Date(event.date).toLocaleDateString()}
                            </div>
                            <div className="event-meta-item">
                                <RiTimeLine /> {event.time}
                            </div>
                            <div className="event-meta-item">
                                <RiMapPinLine /> {event.location}
                            </div>
                            <span className={`event-status-badge ${isUpcoming ? 'upcoming' : 'past'}`}>
                                {isUpcoming ? 'Upcoming' : 'Past'}
                            </span>
                        </div>
                    </div>
                    {isUpcoming && (
                        <button
                            className="btn-primary"
                            onClick={() => navigate(`/org/scan/${id}`)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <RiCameraLine /> Open Scanner
                        </button>
                    )}
                </div>

                <div className="event-details-grid">
                    {/* Left Column: Description & Image */}
                    <div className="event-left-col">
                        <div className="event-description-section">
                            <h3 className="sidebar-title">About Event</h3>
                            {event.imageUrl && (
                                <img
                                    src={getImageUrl(event.imageUrl)}
                                    alt={event.title}
                                    style={{
                                        width: '100%', height: '300px', objectFit: 'cover',
                                        borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem'
                                    }}
                                />
                            )}
                            <p className="event-description-text">{event.description}</p>
                        </div>

                        {/* Ignite 3.0: Discussion Hub */}
                        <DiscussionHub eventId={id} />
                    </div>

                    {/* Right Column: Stats & Participants */}
                    <div className="event-sidebar">
                        <div className="sidebar-card">
                            <h3 className="sidebar-title">Registration</h3>
                            <div className="registration-stat-big">
                                {participants.length}
                            </div>
                            <p className="registration-label">Users Registered</p>
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-100)' }}>
                                <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', margin: 0 }}>
                                    <strong>Max Capacity:</strong> {event.maxParticipants}
                                </p>
                                {event.deadline && (
                                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', margin: '0.5rem 0 0 0' }}>
                                        <strong>Deadline:</strong> {new Date(event.deadline).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="sidebar-card">
                            <h3 className="sidebar-title"><RiGroupLine /> Participants</h3>
                            {participants.length === 0 ? (
                                <p className="no-data" style={{ color: 'var(--gray-500)', fontStyle: 'italic' }}>
                                    No registrations yet.
                                </p>
                            ) : (
                                <div className="participants-list-container">
                                    {participants.map(user => (
                                        <div key={user._id} className="participant-row" onClick={() => handleUserClick(user)}>
                                            <div className="participant-avatar-small">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="participant-info-small">
                                                <h4>{user.name}</h4>
                                                <p>{user.email}</p>
                                            </div>
                                            {user.status === 'Attended' ? (
                                                <span className="user-status-badge attended" style={{ marginLeft: 'auto', background: 'var(--green-100)', color: 'var(--green-600)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                                    ATTENDED
                                                </span>
                                            ) : (
                                                <button
                                                    className="btn-checkin-manual"
                                                    onClick={(e) => handleManualCheckIn(user._id, e)}
                                                    style={{
                                                        marginLeft: 'auto',
                                                        padding: '0.25rem 0.5rem',
                                                        fontSize: '0.7rem',
                                                        background: 'var(--indigo-600)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Check-in
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <UserDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={selectedUser}
            />
        </div>
    );
};

export default OrgEventDetailsPage;
