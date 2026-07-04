import React, { useState, useContext } from 'react';
import './EventCard.css';
import { getImageUrl } from '../utils/imageUrl';
import {
  RiCalendarLine,
  RiMapPinLine,
  RiTimeLine,
  RiGroupLine,
  RiBuildingLine,
  RiCloseLine,
  RiWifiLine, // New
  RiTimerLine, // New
  RiAwardLine, // New (Ignite 3.0)
} from 'react-icons/ri';
import { generateCertificate } from '../utils/CertificateUtility';
import { UserContext } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { generateICS } from '../utils/icsGenerator';
import { QRCodeSVG } from 'qrcode.react';
import DiscussionHub from '../components/DiscussionHub';

// --- DETAILS MODAL ---
const EventDetailsModal = ({ isOpen, onClose, event, isAlreadyJoined, onGetTicketClick }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box event-details-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{event.title}</h2>
          <button className="modal-close-btn" onClick={onClose}><RiCloseLine /></button>
        </div>
        <div className="modal-body">
          <img
            src={getImageUrl(event.imageUrl, `https://placehold.co/600x300/eef2ff/4f46e5?text=${event.title.charAt(0)}`)}
            alt={event.title}
            className="event-details-image"
          />
          <div className="event-details-content">
            <p className="event-description">{event.description}</p>

            <div className="event-meta-grid">
              <div className="meta-item"><RiCalendarLine /> {new Date(event.date).toLocaleDateString()}</div>
              <div className="meta-item"><RiTimeLine /> {event.time}</div>
              <div className="meta-item"><RiMapPinLine /> {event.location}</div>
              <div className="meta-item"><RiBuildingLine /> {event.createdBy?.name || 'Organization'}</div>
              <div className="meta-item"><RiGroupLine /> {event.participants?.length || 0} / {event.maxParticipants} Registered</div>
              <div className="meta-item"><RiWifiLine /> {event.mode || 'Offline'}</div>
              {event.deadline && <div className="meta-item"><RiTimerLine /> Deadline: {new Date(event.deadline).toLocaleDateString()}</div>}
            </div>

            {/* Ignite 3.0: Discussion Hub */}
            <div style={{ marginTop: '2rem' }}>
              <DiscussionHub eventId={event._id} />
            </div>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Close</button>
          <button
            className="btn-outline-primary"
            onClick={() => generateICS(event)}
            style={{ marginRight: 'auto' }}
          >
            Add to Calendar
          </button>
          {isAlreadyJoined && (
            <button className="btn-submit" onClick={() => { onClose(); onGetTicketClick(); }}>Get Ticket</button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- REGISTRATION MODAL ---
const RegistrationModal = ({ isOpen, onClose, event, user, onConfirm }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    contact: user?.contact || '',
    college: user?.college || '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (name, value) => {
    // Numeric and length restriction for contact field
    if (name === "contact") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.contact.trim()) {
      newErrors.contact = "Contact number is required";
    } else if (!/^\d{10}$/.test(formData.contact.trim())) {
      newErrors.contact = "Required 10-digit number";
    }

    if (!formData.college.trim()) {
      newErrors.college = "College/Organization is required";
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    if (!validateForm()) return;

    setIsLoading(true);
    await onConfirm(formData);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Register for {event.title}</h2>
          <button className="modal-close-btn" onClick={onClose}><RiCloseLine /></button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            <p className="modal-subtitle">Please confirm your details to register.</p>
            <div className="form-group">
              <label>Full Name *</label>
              <input value={formData.name} onChange={e => handleChange("name", e.target.value)} className={`form-input ${fieldErrors.name ? "input-error" : ""}`} />
              {fieldErrors.name && <span className="field-error-text">{fieldErrors.name}</span>}
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input value={formData.email} onChange={e => handleChange("email", e.target.value)} className={`form-input ${fieldErrors.email ? "input-error" : ""}`} type="email" />
              {fieldErrors.email && <span className="field-error-text">{fieldErrors.email}</span>}
            </div>
            <div className="form-group">
              <label>Contact Number *</label>
              <input value={formData.contact} onChange={e => handleChange("contact", e.target.value)} className={`form-input ${fieldErrors.contact ? "input-error" : ""}`} placeholder="+91 98765 43210" />
              {fieldErrors.contact && <span className="field-error-text">{fieldErrors.contact}</span>}
            </div>
            <div className="form-group">
              <label>College / Organization *</label>
              <input value={formData.college} onChange={e => handleChange("college", e.target.value)} className={`form-input ${fieldErrors.college ? "input-error" : ""}`} placeholder="University Name" />
              {fieldErrors.college && <span className="field-error-text">{fieldErrors.college}</span>}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={isLoading}>{isLoading ? "Registering..." : "Confirm Registration"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};


const TicketModal = ({ isOpen, onClose, event, user }) => {
  if (!isOpen) return null;

  // The ticket data is a JSON string of event info and user info
  const ticketData = JSON.stringify({
    eventId: event._id,
    userId: user?._id,
    timestamp: new Date().toISOString()
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box ticket-modal" style={{ maxWidth: '400px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Your Ticket</h2>
          <button className="modal-close-btn" onClick={onClose}><RiCloseLine /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem' }}>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '1rem', boxShadow: 'var(--shadow-md)' }}>
            <QRCodeSVG value={ticketData} size={200} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: '0.5rem 0' }}>{event.title}</h3>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Present this QR at the venue</p>
          </div>
          <div style={{ width: '100%', borderTop: '1px dashed var(--gray-200)', marginTop: '1rem', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--gray-600)' }}>
              <span>User:</span>
              <span style={{ fontWeight: '600' }}>{user?.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--gray-600)', marginTop: '0.5rem' }}>
              <span>Date:</span>
              <span style={{ fontWeight: '600' }}>{new Date(event.date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-primary" onClick={() => window.print()} style={{ width: '100%' }}>Print Ticket</button>
        </div>
      </div>
    </div>
  );
};


const EventCard = ({ event, onEventUpdate, showLeaveButton = false, isPast = false }) => {
  const { currentUser } = useContext(UserContext);
  const { confirm } = useConfirm();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isJoined, setIsJoined] = useState(false); // Optimistic UI

  // Modals
  const [showDetails, setShowDetails] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showTicket, setShowTicket] = useState(false);

  // Check if already joined and status
  const participantRecord = event.participants?.find(p => (p.user?._id || p.user || p).toString() === currentUser?._id);
  const waitlistRecord = event.waitlist?.find(w => (w.user?._id || w.user || w).toString() === currentUser?._id);

  const isAlreadyJoined = !!participantRecord || isJoined;
  const isWaitlisted = !!waitlistRecord;
  const isAttended = participantRecord?.status === 'Attended';
  const isFull = (event.participants?.length || 0) >= event.maxParticipants;
  const isDeadlinePassed = event.deadline && new Date(event.deadline) < new Date(new Date().toISOString().split('T')[0]);

  const handleRegister = async (registrationData) => {
    setIsLoading(true);
    const token = localStorage.getItem('igniteUserToken') || sessionStorage.getItem('igniteUserToken');
    try {
      console.log("Registration Data:", registrationData);

      const response = await fetch(`http://localhost:5000/api/events/${event._id}/join`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to join');

      setIsJoined(true);
      if (onEventUpdate) onEventUpdate();

      if (data.isWaitlisted) {
        toast.info(`You have been added to the waitlist for "${event.title}"`);
      } else {
        toast.success(`Successfully registered for "${event.title}"! 🎉`);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeave = async () => {
    const isConfirmed = await confirm(`Are you sure you want to leave ${event.title}?`, "Leave Event");
    if (!isConfirmed) return;

    setIsLoading(true);
    const token = localStorage.getItem('igniteUserToken') || sessionStorage.getItem('igniteUserToken');
    try {
      const response = await fetch(`http://localhost:5000/api/events/${event._id}/leave`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to leave');

      setIsJoined(false);
      if (onEventUpdate) onEventUpdate();
      toast.info(`You have left "${event.title}"`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- PROGRESS BAR ---
  const progressPercentage = event.maxParticipants > 0 ? ((event.participants?.length || 0) / event.maxParticipants) * 100 : 0;

  return (
    <>
      <div className={`event-card ${isPast ? 'past-event-card' : ''}`}>
        <div className="event-image-container">
          <img
            src={getImageUrl(event.imageUrl, `https://placehold.co/400x200/eef2ff/4f46e5?text=${event.title.charAt(0)}`)}
            alt={event.title}
            className="event-card-image"
          />
          <span className="event-category-badge">{event.category}</span>
          {isPast && <span className="event-status-badge past">Past</span>}
        </div>

        <div className="event-card-content">
          <h3 className="event-card-title">{event.title}</h3>

          <div className="event-card-meta">
            <div className="meta-row">
              <RiCalendarLine className="meta-icon" />
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </div>
            <div className="meta-row">
              <RiMapPinLine className="meta-icon" />
              <span>{event.location} ({event.mode || 'Offline'})</span>
            </div>
            {event.deadline && (
              <div className="meta-row">
                <RiTimerLine className="meta-icon" />
                <span style={isDeadlinePassed ? { color: 'var(--red-600, #dc2626)', fontWeight: 600 } : {}}>
                  Deadline: {new Date(event.deadline).toLocaleDateString()}
                  {isDeadlinePassed && ' (Closed)'}
                </span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="event-progress-container">
            <div className="progress-label">
              <span><RiGroupLine /> {event.participants?.length || 0} / {event.maxParticipants}</span>
              <span>{Math.round(progressPercentage)}% Full</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${Math.min(progressPercentage, 100)}%` }}></div>
            </div>
          </div>

          <div className="event-card-actions">
            <button className="btn-outline-primary" onClick={() => setShowDetails(true)}>
              View Details
            </button>
            {isAlreadyJoined && !isPast && (
              <button
                className="btn-outline-primary"
                onClick={() => generateICS(event)}
                title="Add to Calendar"
                style={{ flex: '0 0 auto', padding: '0.55rem 0.75rem' }}
              >
                <RiCalendarLine />
              </button>
            )}
            {isAttended && (
              <button
                className="btn-outline-primary"
                onClick={() => generateCertificate(currentUser?.name, event.title, event.date)}
                title="Download Certificate"
                style={{
                  flex: '0 0 auto',
                  padding: '0.55rem 0.75rem',
                  borderColor: 'var(--success-color, #10b981)',
                  color: 'var(--success-color, #10b981)'
                }}
              >
                <RiAwardLine />
              </button>
            )}
            {/* Show Leave Button (if requested) or Join Button (default) */}
            {currentUser?.role !== 'admin' && currentUser?.role !== 'org_admin' && currentUser?.role !== 'super_admin' && (
              <>
                {showLeaveButton && isAlreadyJoined && !isPast ? (
                  <button
                    className="btn-primary"
                    style={{ background: 'var(--red-600)' }}
                    onClick={handleLeave}
                    disabled={isLoading}
                  >
                    {isLoading ? '...' : 'Leave'}
                  </button>
                ) : (
                  <button
                    className={`btn-primary ${isAlreadyJoined ? 'btn-success' : ''}`}
                    onClick={() => {
                      if (isAlreadyJoined || isWaitlisted) {
                        setShowTicket(true);
                        return;
                      }
                      setShowRegister(true);
                    }}
                    disabled={isLoading || isPast || (isDeadlinePassed && !isAlreadyJoined && !isWaitlisted) || (isFull && !isAlreadyJoined && isWaitlisted)}
                  >
                    {isLoading ? '...' :
                      isAttended ? 'View Certificate' :
                        isAlreadyJoined ? 'View Ticket' :
                          isWaitlisted ? 'Waitlisted' :
                            isPast ? 'Ended' :
                              isDeadlinePassed ? 'Deadline Passed' :
                                isFull ? 'Join Waitlist' :
                                  'Register'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <EventDetailsModal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        event={event}
        isAlreadyJoined={isAlreadyJoined || isWaitlisted}
        onGetTicketClick={() => setShowTicket(true)}
      />

      <RegistrationModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        event={event}
        user={currentUser}
        onConfirm={handleRegister}
      />

      <TicketModal
        isOpen={showTicket}
        onClose={() => setShowTicket(false)}
        event={event}
        user={currentUser}
      />
    </>
  );
};

export default EventCard;