import React, { useState, useEffect, useContext } from "react";
import Admindasnav from "../components/Admindasnav";
import "./EventsHeader.css"; // Corrected CSS import
import { UserContext } from "../context/UserContext";
import { useConfirm } from "../context/ConfirmContext";
import { getImageUrl } from "../utils/imageUrl";
import {
  RiAddLine,
  RiSearchLine,
  RiCalendarLine,
  RiTimeLine,
  RiMapPinLine,
  RiGroupLine,
  RiUploadCloud2Line,
  RiCloseLine,
  RiCalendarEventLine,
  RiPencilLine,
  RiDeleteBinLine,
  RiGlobalLine,
  RiCheckLine,
} from "react-icons/ri";

// --- Create Event Modal Component ---
const CreateEventModal = ({ isOpen, onClose, onEventCreated }) => {
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

    const fileInput = document.getElementById('eventImage-create');
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

      const fileInput = document.getElementById('eventImage-create');
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
      setImageName(""); setImagePreview(null); setError("");
      if (fileInput) fileInput.value = '';

      onEventCreated();
      onClose();
    } catch (err) {
      console.error("Error creating event:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-box-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <RiCalendarEventLine /> Create New Event
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <RiCloseLine />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {error && <div className="form-error-banner"><span>⚠</span> {error}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="title-create">Event Title *</label>
            <div className="input-with-icon">
              <RiCalendarEventLine className="input-icon-left" />
              <input id="title-create" name="title" type="text" className={`form-input form-input-icon ${fieldErrors.title ? "input-error" : ""}`}
                placeholder="e.g., Annual Tech Summit 2026" value={formData.title} onChange={handleChange} />
            </div>
            {fieldErrors.title && <span className="field-error-text">{fieldErrors.title}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description-create">Description *</label>
            <textarea id="description-create" name="description" className={`form-textarea ${fieldErrors.description ? "input-error" : ""}`} rows="3"
              placeholder="Describe your event — topics, speakers, what to expect..." value={formData.description}
              onChange={handleChange}></textarea>
            {fieldErrors.description && <span className="field-error-text">{fieldErrors.description}</span>}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="date-create">Event Date *</label>
              <div className="input-with-icon">
                <RiCalendarLine className="input-icon-left" />
                <input id="date-create" name="date" type="date" className={`form-input form-input-icon ${fieldErrors.date ? "input-error" : ""}`}
                  min={new Date().toISOString().split('T')[0]} value={formData.date} onChange={handleChange} />
              </div>
              {fieldErrors.date && <span className="field-error-text">{fieldErrors.date}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="time-create">Event Time *</label>
              <div className="input-with-icon">
                <RiTimeLine className="input-icon-left" />
                <input id="time-create" name="time" type="time" className={`form-input form-input-icon ${fieldErrors.time ? "input-error" : ""}`}
                  value={formData.time} onChange={handleChange} />
              </div>
              {fieldErrors.time && <span className="field-error-text">{fieldErrors.time}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="location-create">Location *</label>
            <div className="input-with-icon">
              <RiMapPinLine className="input-icon-left" />
              <input id="location-create" name="location" type="text" className={`form-input form-input-icon ${fieldErrors.location ? "input-error" : ""}`}
                placeholder="e.g., Convention Center, Hall B" value={formData.location} onChange={handleChange} />
            </div>
            {fieldErrors.location && <span className="field-error-text">{fieldErrors.location}</span>}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Mode</label>
              <div className="mode-toggle-group">
                <button type="button" className={`mode-chip ${formData.mode === 'Offline' ? 'mode-chip-active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, mode: 'Offline' }))}>
                  <RiMapPinLine /> Offline
                </button>
                <button type="button" className={`mode-chip ${formData.mode === 'Online' ? 'mode-chip-active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, mode: 'Online' }))}>
                  <RiGlobalLine /> Online
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Registration Deadline</label>
              <div className="input-with-icon">
                <RiTimeLine className="input-icon-left" />
                <input type="date" name="deadline" className={`form-input form-input-icon ${fieldErrors.deadline ? "input-error" : ""}`}
                  min={new Date().toISOString().split('T')[0]} value={formData.deadline} onChange={handleChange} />
              </div>
              {fieldErrors.deadline && <span className="field-error-text">{fieldErrors.deadline}</span>}
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="category-create">Category</label>
              <select id="category-create" name="category" className="form-select"
                value={formData.category} onChange={handleChange}>
                <option>Technology</option><option>Business</option><option>Entertainment</option>
                <option>Sports</option><option>Education</option><option>Cultural</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="maxParticipants-create">Max Participants *</label>
              <div className="input-with-icon">
                <RiGroupLine className="input-icon-left" />
                <input id="maxParticipants-create" name="maxParticipants" type="number" className={`form-input form-input-icon ${fieldErrors.maxParticipants ? "input-error" : ""}`}
                  min="1" placeholder="50" value={formData.maxParticipants} onChange={handleChange} />
              </div>
              {fieldErrors.maxParticipants && <span className="field-error-text">{fieldErrors.maxParticipants}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="eventImage-create">Event Banner *</label>
            <label className={`file-upload-area ${fieldErrors.image ? "input-error" : ""}`} htmlFor="eventImage-create" style={fieldErrors.image ? { borderColor: 'var(--error-500)', backgroundColor: 'var(--error-50)' } : {}}>
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
            <input id="eventImage-create" type="file" accept="image/*" className="hidden-file-input"
              onChange={handleFileChange} />
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

// --- NEW: Edit Event Modal Component ---
const EditEventModal = ({ isOpen, onClose, onEventUpdated, eventData }) => {
  const [formData, setFormData] = useState(eventData || {});
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData(eventData || {});
    setFieldErrors({});
  }, [eventData]);

  if (!isOpen) {
    return null;
  }

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
    setError("");

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("igniteUserToken") || sessionStorage.getItem("igniteUserToken");
      const response = await fetch(`http://localhost:5000/api/events/${eventData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update event.");
      }

      onEventUpdated();
      onClose();
    } catch (err) {
      console.error("Error updating event:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <RiPencilLine /> Edit Event
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <RiCloseLine />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          {error && <p className="auth-error">{error}</p>}

          <div className="form-group">
            <label className="form-label" htmlFor="title-edit">Event Title *</label>
            <div className="input-with-icon">
              <RiCalendarEventLine className="input-icon-left" />
              <input
                id="title-edit"
                name="title"
                type="text"
                className={`form-input form-input-icon ${fieldErrors.title ? "input-error" : ""}`}
                value={formData.title || ''}
                onChange={handleChange}
              />
            </div>
            {fieldErrors.title && <span className="field-error-text">{fieldErrors.title}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description-edit">Description *</label>
            <textarea
              id="description-edit"
              name="description"
              className={`form-textarea ${fieldErrors.description ? "input-error" : ""}`}
              rows="4"
              value={formData.description || ''}
              onChange={handleChange}
            ></textarea>
            {fieldErrors.description && <span className="field-error-text">{fieldErrors.description}</span>}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="date-edit">Event Date *</label>
              <div className="input-with-icon">
                <RiCalendarLine className="input-icon-left" />
                <input
                  id="date-edit"
                  name="date"
                  type="date"
                  className={`form-input form-input-icon ${fieldErrors.date ? "input-error" : ""}`}
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
                  onChange={handleChange}
                />
              </div>
              {fieldErrors.date && <span className="field-error-text">{fieldErrors.date}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="time-edit">Event Time *</label>
              <div className="input-with-icon">
                <RiTimeLine className="input-icon-left" />
                <input
                  id="time-edit"
                  name="time"
                  type="time"
                  className={`form-input form-input-icon ${fieldErrors.time ? "input-error" : ""}`}
                  value={formData.time || ''}
                  onChange={handleChange}
                />
              </div>
              {fieldErrors.time && <span className="field-error-text">{fieldErrors.time}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="deadline-edit">Registration Deadline</label>
              <div className="input-with-icon">
                <RiTimeLine className="input-icon-left" />
                <input
                  id="deadline-edit"
                  name="deadline"
                  type="date"
                  className={`form-input form-input-icon ${fieldErrors.deadline ? "input-error" : ""}`}
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.deadline ? new Date(formData.deadline).toISOString().split('T')[0] : ''}
                  onChange={handleChange}
                />
              </div>
              {fieldErrors.deadline && <span className="field-error-text">{fieldErrors.deadline}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="location-edit">Location *</label>
            <div className="input-with-icon">
              <RiMapPinLine className="input-icon-left" />
              <input
                id="location-edit"
                name="location"
                type="text"
                className={`form-input form-input-icon ${fieldErrors.location ? "input-error" : ""}`}
                value={formData.location || ''}
                onChange={handleChange}
              />
            </div>
            {fieldErrors.location && <span className="field-error-text">{fieldErrors.location}</span>}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="category-edit">Category</label>
              <select
                id="category-edit"
                name="category"
                className="form-select"
                value={formData.category || 'Technology'}
                onChange={handleChange}
              >
                <option>Technology</option>
                <option>Business</option>
                <option>Entertainment</option>
                <option>Sports</option>
                <option>Education</option>
                <option>Cultural</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="maxParticipants-edit">Max Participants *</label>
              <div className="input-with-icon">
                <RiGroupLine className="input-icon-left" />
                <input
                  id="maxParticipants-edit"
                  name="maxParticipants"
                  type="number"
                  className={`form-input form-input-icon ${fieldErrors.maxParticipants ? "input-error" : ""}`}
                  value={formData.maxParticipants || ''}
                  onChange={handleChange}
                />
              </div>
              {fieldErrors.maxParticipants && <span className="field-error-text">{fieldErrors.maxParticipants}</span>}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Event List Item (for Admin Page) ---
const EventListItem = ({ event, onEdit, onDelete, onStatusUpdate }) => {
  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className="status-badge approved">Approved</span>;
      case 'rejected': return <span className="status-badge rejected">Rejected</span>;
      default: return <span className="status-badge pending">Pending</span>;
    }
  };

  return (
    <div className="event-list-item">
      <div className="event-list-info" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexGrow: 1 }}>
        <div className="event-list-image-wrapper">
          <img
            src={getImageUrl(event.imageUrl)}
            alt={event.title}
            className="event-list-image"
          />
          <div className="event-status-overlay">
            {getStatusBadge(event.status)}
          </div>
        </div>

        <div className="event-list-details" style={{ flexGrow: 1 }}>
          <h4 className="event-list-title" style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--gray-900)' }}>
            {event.title}
          </h4>
          <p className="event-list-subtitle" style={{ fontSize: '0.875rem', color: 'var(--gray-500)', margin: '0 0 1rem 0', fontWeight: 500 }}>
            Organized by <span style={{ color: 'var(--indigo-600)', fontWeight: 600 }}>{event.createdBy?.name || "Independent Org"}</span>
          </p>

          <div className="event-list-meta" style={{ display: 'flex', gap: '1.5rem', color: 'var(--gray-500)', fontSize: '0.8125rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <RiCalendarLine style={{ color: 'var(--indigo-500)' }} /> {formattedDate}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <RiMapPinLine style={{ color: 'var(--indigo-500)' }} /> {event.location}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <RiGroupLine style={{ color: 'var(--indigo-500)' }} /> <strong>{event.participants?.length || 0}</strong> / {event.maxParticipants}
            </span>
          </div>
        </div>
      </div>

      <div className="event-list-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {event.status === 'pending' && (
          <div className="approval-actions" style={{ display: 'flex', gap: '0.5rem', paddingRight: '0.75rem', borderRight: '1px solid var(--gray-100)', marginRight: '0.75rem' }}>
            <button className="action-btn btn-approve" style={{ background: '#dcfce7', color: '#166534', border: 'none', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', transition: '0.2s' }} title="Approve" onClick={() => onStatusUpdate(event._id, 'approved')}>
              <RiCheckLine />
            </button>
            <button className="action-btn btn-reject" style={{ background: '#fee2e2', color: '#991b1b', border: 'none', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', transition: '0.2s' }} title="Reject" onClick={() => onStatusUpdate(event._id, 'rejected')}>
              <RiCloseLine />
            </button>
          </div>
        )}
        <button className="action-btn btn-edit" style={{ background: 'var(--gray-50)', color: 'var(--gray-600)', border: '1px solid var(--gray-200)', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', transition: '0.2s' }} title="Edit" onClick={() => onEdit(event)}>
          <RiPencilLine />
        </button>
        <button className="action-btn btn-delete" style={{ background: 'white', color: '#ef4444', border: '1px solid #fee2e2', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', transition: '0.2s' }} title="Delete" onClick={() => onDelete(event._id)}>
          <RiDeleteBinLine />
        </button>
      </div>
    </div>
  );
};

// --- Main Page Component ---
const AdminEventsPage = ({ onLogout }) => {
  const { currentUser } = useContext(UserContext);
  const { confirm } = useConfirm();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEventToEdit, setCurrentEventToEdit] = useState(null);

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(""); // For search
  const [statusFilter, setStatusFilter] = useState(""); // For status filter

  // Fetch all events from the server
  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("igniteUserToken") || sessionStorage.getItem("igniteUserToken");
      const response = await fetch("http://localhost:5000/api/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch events.");
      }
      const data = await response.json();
      setEvents(data.reverse()); // Show newest first
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch events on page load
  useEffect(() => {
    fetchEvents();
  }, []);

  // --- NEW: Handle Edit ---
  const handleEditClick = (event) => {
    setCurrentEventToEdit(event);
    setIsEditModalOpen(true);
  };

  // --- NEW: Handle Delete ---
  const handleDeleteClick = async (eventId) => {
    const isConfirmed = await confirm("Are you sure you want to delete this event?", "Delete Event");
    if (isConfirmed) {
      try {
        const token = localStorage.getItem("igniteUserToken") || sessionStorage.getItem("igniteUserToken");
        const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete event.");
        }

        // Refresh the event list after deleting
        fetchEvents();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // --- NEW: Handle Status Update ---
  const handleStatusUpdate = async (eventId, newStatus) => {
    try {
      const token = localStorage.getItem("igniteUserToken") || sessionStorage.getItem("igniteUserToken");
      const response = await fetch(`http://localhost:5000/api/events/${eventId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update event status.");
      }

      fetchEvents(); // Refresh
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(filter.toLowerCase()) ||
      event.description.toLowerCase().includes(filter.toLowerCase());

    const matchesStatus = !statusFilter || event.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const renderEventList = () => {
    if (isLoading) {
      return (
        <div className="empty-state">
          <p>Loading events...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="empty-state">
          <h3 className="empty-title" style={{ color: "#dc2626" }}>
            Error: {error}
          </h3>
        </div>
      );
    }

    if (filteredEvents.length === 0) {
      return (
        <div className="empty-state">
          <RiCalendarLine className="empty-icon" />
          <h3 className="empty-title">No events found</h3>
          <p className="empty-text">Create your first event to get started or adjust your filters.</p>
        </div>
      );
    }

    // Render the list of events
    return (
      <div className="events-list-container">
        {filteredEvents.map((event) => (
          <EventListItem
            key={event._id}
            event={event}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onStatusUpdate={handleStatusUpdate}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="admin-events-page">
      <Admindasnav
        userName={currentUser?.name}
        userRole={currentUser?.role}
        imageUrl={currentUser?.imageUrl}
        onLogout={onLogout}
      />

      <main className="events-main-content">
        <div className="events-header">
          <h1 className="events-title">Events</h1>
          <button className="create-btn" onClick={() => setIsCreateModalOpen(true)}>
            <RiAddLine /> Create Event
          </button>
        </div>

        <div className="filter-box">
          <div className="filter-grid">
            <div className="filter-item">
              <label htmlFor="search" className="filter-label">Search Events</label>
              <div className="input-wrapper">
                <input
                  id="search"
                  type="text"
                  placeholder="Search by title or description..."
                  className="filter-input"
                  onChange={(e) => setFilter(e.target.value)}
                />
                <RiSearchLine className="input-icon" />
              </div>
            </div>
            <div className="filter-item">
              <label htmlFor="status" className="filter-label">Status Filter</label>
              <div className="input-wrapper">
                <select
                  id="status"
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="events-grid-container">
          {renderEventList()}
        </div>
      </main>

      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={fetchEvents} // Pass the fetchEvents function as a prop
      />

      {currentEventToEdit && (
        <EditEventModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onEventUpdated={fetchEvents}
          eventData={currentEventToEdit}
        />
      )}
    </div>
  );
};

export default AdminEventsPage;
