import React, { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "../context/ConfirmContext";
import OrgDashboardNavbar from "../components/OrgDashboardNavbar";
import {
    RiCalendarEventLine,
    RiAddLine,
    RiGroupLine,
    RiTimeLine,
    RiMapPinLine,
    RiPencilLine,
    RiDeleteBinLine,
    RiCloseLine,
    RiBuildingLine,
    RiCalendarCheckFill,
    RiCalendarEventFill,
    RiTeamFill,
    RiRocketLine,
    RiGlobalLine,
    RiUploadCloud2Line,
    RiCalendarLine,
} from "react-icons/ri";
import "./Dashboard.css"; // Reuse dashboard styles
import "./OrgDashboard.css"; // Org specific overrides
import { getImageUrl } from "../utils/imageUrl";

// --- MODAL COMPONENTS (Kept same logic, just Ensure styles apply) ---

const CreateEventModal = ({ isOpen, onClose, onEventCreated }) => {
    const toast = useToast();
    const [formData, setFormData] = useState({
        title: "", description: "", date: "", time: "", location: "",
        category: "Technology", maxParticipants: 50, imageUrl: "",
        mode: "Offline", deadline: "",
    });
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [imageName, setImageName] = useState("");
    const [imagePreview, setImagePreview] = useState(null);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageName(file.name);
            setImagePreview(URL.createObjectURL(file));
            if (fieldErrors.image) {
                setFieldErrors(prev => ({ ...prev, image: "" }));
            }
        } else {
            setImageName("");
            setImagePreview(null);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (!formData.description.trim()) newErrors.description = "Description is required";
        if (!formData.date) {
            newErrors.date = "Date is required";
        } else if (new Date(formData.date) < today) {
            newErrors.date = "Event date cannot be in the past";
        }
        if (!formData.time) newErrors.time = "Time is required";
        if (formData.mode === "Offline" && !formData.location.trim()) {
            newErrors.location = "Location is required for offline events";
        }
        if (!formData.maxParticipants || formData.maxParticipants <= 0) {
            newErrors.maxParticipants = "Must be at least 1";
        }

        if (formData.deadline && formData.date) {
            if (new Date(formData.deadline) > new Date(formData.date)) {
                newErrors.deadline = "Deadline cannot be after event date";
            }
        }

        const fileInput = document.getElementById('eventImage-org-create');
        if (!fileInput || !fileInput.files[0]) {
            newErrors.image = "Event banner is required";
        }

        setFieldErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setFieldErrors({});

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const token = localStorage.getItem("igniteUserToken") || sessionStorage.getItem("igniteUserToken");
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => formDataToSend.append(key, formData[key]));

            const fileInput = document.getElementById('eventImage-org-create');
            if (fileInput && fileInput.files[0]) {
                formDataToSend.append('image', fileInput.files[0]);
            }

            const response = await fetch("http://localhost:5000/api/events", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formDataToSend,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to create event.");

            setFormData({
                title: "", description: "", date: "", time: "", location: "",
                category: "Technology", maxParticipants: 50, imageUrl: "", mode: "Offline", deadline: ""
            });
            setImageName(""); setImagePreview(null);
            if (fileInput) fileInput.value = '';
            onEventCreated();
            onClose();
            toast.success('Event created successfully! It\'s now pending approval. 🎉');
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box modal-box-lg" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title"><RiCalendarEventLine /> Create New Event</h2>
                    <button className="modal-close-btn" onClick={onClose}><RiCloseLine /></button>
                </div>
                <form className="modal-form" onSubmit={handleSubmit}>
                    {error && <div className="form-error-banner"><span>⚠</span> {error}</div>}

                    <div className="form-group">
                        <label className="form-label">Event Title *</label>
                        <div className="input-with-icon">
                            <RiCalendarEventLine className="input-icon-left" />
                            <input name="title" className={`form-input form-input-icon ${fieldErrors.title ? "input-error" : ""}`} placeholder="e.g., Annual Tech Summit 2026" value={formData.title} onChange={handleChange} />
                        </div>
                        {fieldErrors.title && <span className="field-error-text">{fieldErrors.title}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description *</label>
                        <textarea name="description" className={`form-textarea ${fieldErrors.description ? "input-error" : ""}`} rows="3" placeholder="Describe your event — topics, speakers, what to expect..." value={formData.description} onChange={handleChange} />
                        {fieldErrors.description && <span className="field-error-text">{fieldErrors.description}</span>}
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Event Date *</label>
                            <div className="input-with-icon">
                                <RiCalendarLine className="input-icon-left" />
                                <input type="date" name="date" className={`form-input form-input-icon ${fieldErrors.date ? "input-error" : ""}`} min={new Date().toISOString().split('T')[0]} value={formData.date} onChange={handleChange} />
                            </div>
                            {fieldErrors.date && <span className="field-error-text">{fieldErrors.date}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Event Time *</label>
                            <div className="input-with-icon">
                                <RiTimeLine className="input-icon-left" />
                                <input type="time" name="time" className={`form-input form-input-icon ${fieldErrors.time ? "input-error" : ""}`} value={formData.time} onChange={handleChange} />
                            </div>
                            {fieldErrors.time && <span className="field-error-text">{fieldErrors.time}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Location *</label>
                        <div className="input-with-icon">
                            <RiMapPinLine className="input-icon-left" />
                            <input name="location" className={`form-input form-input-icon ${fieldErrors.location ? "input-error" : ""}`} placeholder="e.g., Convention Center, Hall B" value={formData.location} onChange={handleChange} />
                        </div>
                        {fieldErrors.location && <span className="field-error-text">{fieldErrors.location}</span>}
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Mode</label>
                            <div className="mode-toggle-group">
                                <button type="button"
                                    className={`mode-chip ${formData.mode === 'Offline' ? 'mode-chip-active' : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, mode: 'Offline' }))}>
                                    <RiMapPinLine /> Offline
                                </button>
                                <button type="button"
                                    className={`mode-chip ${formData.mode === 'Online' ? 'mode-chip-active' : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, mode: 'Online' }))}>
                                    <RiGlobalLine /> Online
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Registration Deadline</label>
                            <div className="input-with-icon">
                                <RiTimeLine className="input-icon-left" />
                                <input type="date" name="deadline" className={`form-input form-input-icon ${fieldErrors.deadline ? "input-error" : ""}`} min={new Date().toISOString().split('T')[0]} value={formData.deadline} onChange={handleChange} />
                            </div>
                            {fieldErrors.deadline && <span className="field-error-text">{fieldErrors.deadline}</span>}
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select name="category" className="form-select" value={formData.category} onChange={handleChange}>
                                <option>Technology</option><option>Business</option><option>Entertainment</option>
                                <option>Sports</option><option>Education</option><option>Cultural</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Max Participants *</label>
                            <div className="input-with-icon">
                                <RiGroupLine className="input-icon-left" />
                                <input type="number" name="maxParticipants" className={`form-input form-input-icon ${fieldErrors.maxParticipants ? "input-error" : ""}`} min="1" placeholder="50" value={formData.maxParticipants} onChange={handleChange} />
                            </div>
                            {fieldErrors.maxParticipants && <span className="field-error-text">{fieldErrors.maxParticipants}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Event Banner *</label>
                        <label className={`file-upload-area ${fieldErrors.image ? "input-error" : ""}`} htmlFor="eventImage-org-create" style={fieldErrors.image ? { borderColor: 'var(--error-500)', backgroundColor: 'var(--error-50)' } : {}}>
                            {imagePreview ? (
                                <div className="file-preview">
                                    <img src={imagePreview} alt="Preview" className="file-preview-img" />
                                    <span className="file-preview-name">{imageName}</span>
                                </div>
                            ) : (
                                <>
                                    <RiUploadCloud2Line className="file-upload-icon" />
                                    <span className="file-upload-text">Click to upload or drag and drop</span>
                                    <span className="file-upload-hint">PNG, JPG or GIF up to 5MB</span>
                                </>
                            )}
                        </label>
                        <input type="file" id="eventImage-org-create" className="hidden-file-input" accept="image/*" onChange={handleFileChange} />
                        {fieldErrors.image && <span className="field-error-text">{fieldErrors.image}</span>}
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={isLoading}>Cancel</button>
                        <button type="submit" className="btn-submit btn-create-event" disabled={isLoading}>
                            {isLoading ? (<><span className="btn-spinner"></span> Creating...</>) : (<><RiAddLine /> Create Event</>)}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditEventModal = ({ isOpen, onClose, onEventUpdated, eventData }) => {
    const [formData, setFormData] = useState(eventData || {});
    const [isLoading, setIsLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => { setFormData(eventData || {}); setFieldErrors({}); }, [eventData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!formData.title?.trim()) newErrors.title = "Title is required";
        if (!formData.description?.trim()) newErrors.description = "Description is required";
        if (!formData.date) {
            newErrors.date = "Date is required";
        } else if (new Date(formData.date) < today) {
            newErrors.date = "Event date cannot be in the past";
        }
        if (!formData.time) newErrors.time = "Time is required";
        if (formData.mode === "Offline" && !formData.location?.trim()) {
            newErrors.location = "Location is required for offline events";
        }
        if (!formData.maxParticipants || formData.maxParticipants <= 0) {
            newErrors.maxParticipants = "Must be at least 1";
        }

        if (formData.deadline && formData.date) {
            if (new Date(formData.deadline) > new Date(formData.date)) {
                newErrors.deadline = "Deadline cannot be after event date";
            }
        }

        setFieldErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFieldErrors({});

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const token = localStorage.getItem("igniteUserToken") || sessionStorage.getItem("igniteUserToken");
            const response = await fetch(`http://localhost:5000/api/events/${eventData._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error("Failed to update event.");
            onEventUpdated();
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title"><RiPencilLine /> Edit Event</h2>
                    <button className="modal-close-btn" onClick={onClose}><RiCloseLine /></button>
                </div>
                <form className="modal-form" onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label className="form-label">Title *</label>
                        <div className="input-with-icon">
                            <RiCalendarEventLine className="input-icon-left" />
                            <input name="title" className={`form-input form-input-icon ${fieldErrors.title ? "input-error" : ""}`} value={formData.title || ''} onChange={handleChange} />
                        </div>
                        {fieldErrors.title && <span className="field-error-text">{fieldErrors.title}</span>}
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description *</label>
                        <textarea name="description" className={`form-textarea ${fieldErrors.description ? "input-error" : ""}`} rows="3" value={formData.description || ''} onChange={handleChange} />
                        {fieldErrors.description && <span className="field-error-text">{fieldErrors.description}</span>}
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Date *</label>
                            <div className="input-with-icon">
                                <RiCalendarLine className="input-icon-left" />
                                <input type="date" name="date" className={`form-input form-input-icon ${fieldErrors.date ? "input-error" : ""}`} min={new Date().toISOString().split('T')[0]} value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''} onChange={handleChange} />
                            </div>
                            {fieldErrors.date && <span className="field-error-text">{fieldErrors.date}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Time *</label>
                            <div className="input-with-icon">
                                <RiTimeLine className="input-icon-left" />
                                <input type="time" name="time" className={`form-input form-input-icon ${fieldErrors.time ? "input-error" : ""}`} value={formData.time || ''} onChange={handleChange} />
                            </div>
                            {fieldErrors.time && <span className="field-error-text">{fieldErrors.time}</span>}
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Location *</label>
                        <div className="input-with-icon">
                            <RiMapPinLine className="input-icon-left" />
                            <input name="location" className={`form-input form-input-icon ${fieldErrors.location ? "input-error" : ""}`} placeholder="e.g., Convention Center, Hall B" value={formData.location || ''} onChange={handleChange} />
                        </div>
                        {fieldErrors.location && <span className="field-error-text">{fieldErrors.location}</span>}
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Mode</label>
                            <select name="mode" className="form-select" value={formData.mode || 'Offline'} onChange={handleChange}>
                                <option value="Offline">Offline</option>
                                <option value="Online">Online</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Registration Deadline</label>
                            <div className="input-with-icon">
                                <RiTimeLine className="input-icon-left" />
                                <input type="date" name="deadline" className={`form-input form-input-icon ${fieldErrors.deadline ? "input-error" : ""}`} min={new Date().toISOString().split('T')[0]} value={formData.deadline ? new Date(formData.deadline).toISOString().split('T')[0] : ''} onChange={handleChange} />
                            </div>
                            {fieldErrors.deadline && <span className="field-error-text">{fieldErrors.deadline}</span>}
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Max Participants *</label>
                        <div className="input-with-icon">
                            <RiGroupLine className="input-icon-left" />
                            <input type="number" name="maxParticipants" className={`form-input form-input-icon ${fieldErrors.maxParticipants ? "input-error" : ""}`} min="1" placeholder="50" value={formData.maxParticipants || ''} onChange={handleChange} />
                        </div>
                        {fieldErrors.maxParticipants && <span className="field-error-text">{fieldErrors.maxParticipants}</span>}
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ViewParticipantsModal = ({ isOpen, onClose, eventId }) => {
    const [participants, setParticipants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen && eventId) {
            const fetchParticipants = async () => {
                setIsLoading(true);
                try {
                    const token = localStorage.getItem("igniteUserToken") || sessionStorage.getItem("igniteUserToken");
                    const response = await fetch(`http://localhost:5000/api/events/${eventId}/participants`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setParticipants(data);
                    }
                } catch (err) {
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchParticipants();
        }
    }, [isOpen, eventId]);

    if (!isOpen) return null;

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box participants-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title-group">
                        <h2 className="modal-title"><RiGroupLine /> Registered Users</h2>
                        {!isLoading && <span className="participants-count-badge">{participants.length} users</span>}
                    </div>
                    <button className="modal-close-btn" onClick={onClose}><RiCloseLine /></button>
                </div>
                <div className="modal-body">
                    {isLoading ? (
                        <div className="participants-loading">
                            <div className="participants-spinner"></div>
                            <p>Loading participants...</p>
                        </div>
                    ) : participants.length === 0 ? (
                        <div className="participants-empty">
                            <div className="participants-empty-icon">👥</div>
                            <h3>No registered users yet</h3>
                            <p>Share your event to get participants!</p>
                        </div>
                    ) : (
                        <ul className="participant-list">
                            {participants.map((p, index) => (
                                <li key={p._id} className="participant-item">
                                    <span className="participant-index">{index + 1}</span>
                                    <div className="participant-avatar">
                                        {getInitials(p.name)}
                                    </div>
                                    <div className="participant-info">
                                        <strong className="participant-name">{p.name}</strong>
                                        <span className="participant-email">{p.email}</span>
                                        {(p.college || p.contact) && (
                                            <span className="participant-meta">
                                                {p.college && <span>{p.college}</span>}
                                                {p.college && p.contact && <span> · </span>}
                                                {p.contact && <span>{p.contact}</span>}
                                            </span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- ORG EVENT ITEM COMPONENT ---
const OrgEventItem = ({ event, onEdit, onDelete, onViewUsers, navigate }) => {
    const handleTitleClick = () => {
        navigate(`/org/event/${event._id}`);
    };

    return (
        <div className="org-event-item">
            {/* Image */}
            <img
                src={
                    getImageUrl(event.imageUrl, `https://placehold.co/100x100/eef2ff/4f46e5?text=${event.title.charAt(0)}`)
                }
                alt={event.title}
                className="event-item-image"
                style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-lg)' }}
            />

            {/* Details */}
            <div className="event-item-details">
                <h4
                    className="event-item-title"
                    onClick={handleTitleClick}
                    style={{ cursor: 'pointer', color: 'var(--indigo-600)' }}
                >
                    {event.title}
                </h4>
                <div className="event-item-meta">
                    <span><RiCalendarEventLine /> {new Date(event.date).toLocaleDateString()}</span>
                    <span><RiTimeLine /> {event.time}</span>
                    <span><RiMapPinLine /> {event.location}</span>
                    <span><RiGroupLine /> {event.participants?.length || 0} Registered</span>
                </div>
            </div>

            {/* Actions */}
            <div className="org-event-actions-buttons" style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-sm btn-outline" onClick={() => onViewUsers(event)}>
                    <RiTeamFill /> Users
                </button>
                <button className="btn-sm btn-outline" onClick={() => onEdit(event)}>
                    <RiPencilLine /> Edit
                </button>
                <button className="btn-sm btn-danger-outline" onClick={() => onDelete(event._id)}>
                    <RiDeleteBinLine /> Delete
                </button>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

export default function OrgDashboard({ onLogout }) {
    const navigate = useNavigate();
    const { currentUser } = useContext(UserContext);
    const { confirm } = useConfirm();
    const [myEvents, setMyEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Derived Stats
    const [stats, setStats] = useState({
        total: 0,
        upcoming: 0,
        participants: 0
    });

    const fetchMyEvents = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("igniteUserToken") || sessionStorage.getItem("igniteUserToken");
            // Filter by current organization/user ID
            const response = await fetch(`http://localhost:5000/api/events?organization=${currentUser._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setMyEvents(data);

                // Calculate Stats
                const upcoming = data.filter(e => new Date(e.date) > new Date()).length;
                const totalParticipants = data.reduce((acc, curr) => acc + (curr.participants?.length || 0), 0);

                setStats({
                    total: data.length,
                    upcoming,
                    participants: totalParticipants
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) fetchMyEvents();
    }, [fetchMyEvents, currentUser]);

    const handleDelete = async (id) => {
        const isConfirmed = await confirm("Are you sure you want to delete this event?", "Delete Event");
        if (!isConfirmed) return;
        try {
            const token = localStorage.getItem("igniteUserToken") || sessionStorage.getItem("igniteUserToken");
            await fetch(`http://localhost:5000/api/events/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchMyEvents();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="dashboard-page">
            <OrgDashboardNavbar
                user={currentUser}
                onLogout={onLogout}
                onCreateEventClick={() => setIsCreateModalOpen(true)}
            />

            <main className="dashboard-content-area">
                {/* --- Welcome Banner --- */}
                <div className="welcome-banner">
                    <div className="banner-text">
                        <h1 className="banner-title">
                            Admin Dashboard
                        </h1>
                        <p className="banner-subtitle">
                            Manage your organization's events and participants.
                        </p>
                    </div>
                    <div className="banner-icon">
                        <RiBuildingLine />
                    </div>
                </div>

                {/* --- Stats Grid --- */}
                <div className="dashboard-stats-grid">
                    <div className="dashboard-stat-item">
                        <div className="stat-icon blue">
                            <RiCalendarEventFill />
                        </div>
                        <div className="stat-info">
                            <span className="stat-title">Total Events</span>
                            <span className="stat-value">{stats.total}</span>
                        </div>
                    </div>
                    <div className="dashboard-stat-item">
                        <div className="stat-icon green">
                            <RiRocketLine />
                        </div>
                        <div className="stat-info">
                            <span className="stat-title">Upcoming Events</span>
                            <span className="stat-value">{stats.upcoming}</span>
                        </div>
                    </div>
                    <div className="dashboard-stat-item">
                        <div className="stat-icon purple">
                            <RiTeamFill />
                        </div>
                        <div className="stat-info">
                            <span className="stat-title">Total Participants</span>
                            <span className="stat-value">{stats.participants}</span>
                        </div>
                    </div>
                </div>

                {/* --- Events Section --- */}
                <div className="card" style={{ marginTop: '2rem' }}>
                    <div className="card-header">
                        <h3 className="card-title">
                            <RiCalendarCheckFill /> Your Events
                        </h3>
                        <button className="btn-create-event" onClick={() => setIsCreateModalOpen(true)}>
                            <RiAddLine /> Create Event
                        </button>
                    </div>
                    <div className="card-body">
                        {isLoading ? <p>Loading events...</p> : (
                            <div className="dashboard-event-list">
                                {myEvents.length === 0 ? (
                                    <div className="card-body-empty">
                                        <RiCalendarEventLine className="empty-icon" />
                                        <p className="empty-text">No events created yet.</p>
                                    </div>
                                ) : myEvents.map(event => (
                                    <OrgEventItem
                                        key={event._id}
                                        event={event}
                                        onEdit={(e) => { setSelectedEvent(e); setIsEditModalOpen(true); }}
                                        onDelete={handleDelete}
                                        onViewUsers={(e) => { setSelectedEvent(e); setIsParticipantsModalOpen(true); }}
                                        navigate={navigate}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </main>

            <CreateEventModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onEventCreated={fetchMyEvents} />
            <EditEventModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} eventData={selectedEvent} onEventUpdated={fetchMyEvents} />
            <ViewParticipantsModal isOpen={isParticipantsModalOpen} onClose={() => setIsParticipantsModalOpen(false)} eventId={selectedEvent?._id} />
        </div>
    );
}
