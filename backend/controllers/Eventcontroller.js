import asyncHandler from 'express-async-handler';
import Event from '../models/Event.js';

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    date,
    time,
    location,
    category,
    maxParticipants,
    mode,
    deadline,
  } = req.body;

  // Validate that event date is not in the past
  const eventDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (eventDate < today) {
    res.status(400);
    throw new Error('Cannot create events in the past. Please select a future date.');
  }

  const createdBy = req.user._id;

  // Handle uploaded image
  let imageUrl = '';
  if (req.file) {
    imageUrl = `/uploads/${req.file.filename}`;
  }

  const event = new Event({
    title,
    description,
    date,
    time,
    location,
    category,
    maxParticipants,
    mode,
    deadline,
    imageUrl,
    createdBy,
    participants: [], // Initialize as empty
    status: req.user.role === 'super_admin' ? 'approved' : 'pending',
  });

  try {
    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error) {
    res.status(400);
    throw new Error('Invalid event data: ' + error.message);
  }
});

// @desc    Fetch all events
// @route   GET /api/events
// @access  Public
const getAllEvents = asyncHandler(async (req, res) => {
  const { keyword, category, date, location, organization, mode } = req.query;

  // Build query object
  let query = {};

  if (keyword) {
    query.title = { $regex: keyword, $options: 'i' };
  }

  if (category) {
    query.category = category;
  }

  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  if (mode) {
    query.mode = mode;
  }

  // Filter by organization (created by users with this name? or createdBy ID?)
  // Assuming organization passed is the NAME of the creator or organization field
  // User model has 'name' which is used as Organization Name for Org Admins.
  // This might require a lookup if filtering by name, or we expect Frontend to pass ID.
  // For simplicity if we pass ID:
  if (organization) {
    query.createdBy = organization;
  }

  // Date filtering (e.g., 'upcoming', 'past', or specific date)
  if (date === 'upcoming') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    query.date = { $gte: today.toISOString().split('T')[0] }; // Comparing string dates as per model
  } else if (date === 'past') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    query.date = { $lt: today.toISOString().split('T')[0] };
  } else if (date) {
    query.date = date;
  }

  // Filter by status based on user role:
  // - Super admins / admins: see all events (with optional status filter)
  // - Org admins viewing their OWN events: see all statuses (pending, approved, rejected)
  // - Regular users / public: only see approved events
  const isSuperAdmin = req.user && (req.user.role === 'super_admin' || req.user.role === 'admin');
  const isOrgAdminViewingOwn = req.user && req.user.role === 'org_admin' && organization;

  if (isSuperAdmin) {
    // Super admins can see all, optionally filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }
  } else if (isOrgAdminViewingOwn) {
    // Org admins see all their own events (pending, approved, rejected)
    // No status filter needed — they need to see pending events they just created
    if (req.query.status) {
      query.status = req.query.status;
    }
  } else {
    // Regular users / public: only see approved events
    query.$or = [
      { status: 'approved' },
      { status: { $exists: false } },
      { status: null }
    ];
  }

  const events = await Event.find(query).populate('createdBy', 'name email').sort({ date: 1 }); // Sort by date ascending (nearest first)
  res.json(events);
});

// @desc    Fetch a single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('createdBy', 'name email');

  if (event) {
    // If user is logged in (req.user exists via protect middleware if applied, but this is Public?)
    // This route is Public, so req.user might be undefined. 
    // However, if we want to show participants to admins, we need to know who the user is.
    // We can conditionally populate in a separate Admin route OR 
    // simple check if we are protected or if we blindly return everything and let frontend hide it.
    // BUT privacy: we shouldn't send participant list to everyone.

    // We will clean the event object before sending it to public.
    // To support "Organization Admin Viewing Registered Users", we need authorized access.
    // Strategy: Return standard details. 
    // For the list of participants, the Org Admin should probably hit a separate endpoint or we need to pass token here.
    // If the frontend sends a token, the 'protect' middleware would attach req.user, BUT this route is likely defined as Public in routes.
    // So 'protect' isn't running.
    // I should create a separate endpoint `getEventParticipants` for Admins.

    res.json(event);
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
});

// @desc    Get event participants
// @route   GET /api/events/:id/participants
// @access  Private/OrgAdmin/SuperAdmin
const getEventParticipants = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('participants.user', 'name email userId contact');

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // Check authorization
  // Allow if Super Admin OR if Org Admin is the creator
  if (
    req.user.role === 'super_admin' ||
    (req.user.role === 'org_admin' && event.createdBy._id.toString() === req.user._id.toString())
  ) {
    // Return a cleaned list where 'user' is the main object and 'status' is attached
    const participantsList = event.participants.map(p => ({
      ...(p.user?._doc || p.user),
      status: p.status,
      checkedInAt: p.checkedInAt
    }));
    res.json(participantsList);
  } else {
    res.status(401);
    throw new Error('Not authorized to view participants for this event');
  }
});

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    date,
    time,
    location,
    category,
    maxParticipants,
    mode,
    deadline,
  } = req.body;

  const event = await Event.findById(req.params.id);

  if (event) {
    // Check ownership
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'super_admin') {
      res.status(401);
      throw new Error('Not authorized to update this event');
    }

    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.time = time || event.time;
    event.location = location || event.location;
    event.category = category || event.category;
    event.maxParticipants = maxParticipants || event.maxParticipants;
    event.mode = mode || event.mode;
    event.deadline = deadline || event.deadline;

    // Handle uploaded image
    if (req.file) {
      event.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
});

// @desc    Update event status (approve/reject)
// @route   PUT /api/events/:id/status
// @access  Private/SuperAdmin
const updateEventStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['approved', 'rejected', 'pending'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const event = await Event.findById(req.params.id);

  if (event) {
    event.status = status;
    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
});

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (event) {
    // Check ownership
    // Note: event.createdBy is an ObjectId, so we convert to string
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'super_admin') {
      res.status(401);
      throw new Error('Not authorized to delete this event');
    }

    await event.deleteOne();
    res.json({ message: 'Event removed' });
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
});

// @desc    Join an event
// @route   PUT /api/events/:id/join
// @access  Private
const joinEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // Check if event is in the past
  const eventDate = new Date(event.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (eventDate < today) {
    res.status(400);
    throw new Error('Cannot join past events');
  }

  // If participants array doesn't exist (old event), create it
  if (!event.participants) {
    event.participants = [];
  }

  const userId = req.user._id;

  const alreadyJoined = event.participants.some(
    (p) => (p.user?._id || p.user || p).toString() === userId.toString()
  );

  if (alreadyJoined) {
    res.status(400);
    throw new Error('User already joined this event');
  }

  if (event.participants.length >= event.maxParticipants) {
    // Ignite 3.0: Add to waitlist instead of erroring
    const alreadyWaitlisted = event.waitlist.some(
      (w) => (w.user?._id || w.user || w).toString() === userId.toString()
    );

    if (alreadyWaitlisted) {
      res.status(400);
      throw new Error('You are already on the waitlist for this event');
    }

    event.waitlist.push({ user: userId });
    await event.save();
    return res.status(200).json({ message: 'Added to waitlist', event, isWaitlisted: true });
  }

  event.participants.push({ user: userId, status: 'Registered' });
  await event.save();

  res.status(200).json(event); // Send back the updated event
});

// @desc    Leave an event
// @route   PUT /api/events/:id/leave
// @access  Private
const leaveEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // --- THIS IS THE FIX ---
  // If participants array doesn't exist (old event), create it
  if (!event.participants) {
    event.participants = [];
  }
  // --- END OF FIX ---

  const userId = req.user._id;

  const wasInParticipants = event.participants.some(
    (p) => (p.user?._id || p.user || p).toString() === userId.toString()
  );

  if (wasInParticipants) {
    event.participants = event.participants.filter(
      (p) => (p.user?._id || p.user || p).toString() !== userId.toString()
    );

    // Ignite 3.0: Promote from waitlist if possible
    if (event.waitlist && event.waitlist.length > 0 && event.participants.length < event.maxParticipants) {
      const nextUser = event.waitlist.shift();
      event.participants.push({ user: nextUser.user, status: 'Registered' });
    }
  } else {
    // Check if they were in waitlist
    const wasInWaitlist = event.waitlist.some(
      (w) => (w.user?._id || w.user || w).toString() === userId.toString()
    );

    if (wasInWaitlist) {
      event.waitlist = event.waitlist.filter(
        (w) => (w.user?._id || w.user || w).toString() !== userId.toString()
      );
    } else {
      res.status(400);
      throw new Error('User has not joined this event or waitlist');
    }
  }

  await event.save();

  res.status(200).json(event); // Send back the updated event
});

// @desc    Check-in a user for an event (Attendance)
// @route   PUT /api/events/:id/checkin
// @access  Private/OrgAdmin/SuperAdmin
const checkInUser = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // Check authorization (OrgAdmin must be the creator)
  if (
    req.user.role !== 'super_admin' &&
    (req.user.role !== 'org_admin' || event.createdBy.toString() !== req.user._id.toString())
  ) {
    res.status(401);
    throw new Error('Not authorized to check-in participants for this event');
  }

  // Find the participant
  const participant = event.participants.find(
    (p) => (p.user?._id || p.user || p).toString() === userId.toString()
  );

  if (!participant) {
    res.status(404);
    throw new Error('User is not registered for this event');
  }

  if (participant.status === 'Attended') {
    res.status(400);
    throw new Error('User is already checked-in');
  }

  // Update status
  participant.status = 'Attended';
  participant.checkedInAt = new Date();

  await event.save();

  res.json({ message: 'Check-in successful', participant });
});

// @desc    Get recommended events for a user
// @route   GET /api/events/recommendations
// @access  Private
const getRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 1. Get events the user has already joined or waitlisted
  const userEvents = await Event.find({
    $or: [
      { 'participants.user': userId },
      { 'waitlist.user': userId }
    ]
  });

  const joinedEventIds = userEvents.map(e => e._id);

  const categories = userEvents.map(e => e.category);

  // 2. Determine preferred categories (most frequent)
  const categoryFreq = {};
  categories.forEach(cat => {
    categoryFreq[cat] = (categoryFreq[cat] || 0) + 1;
  });

  const preferredCategories = Object.keys(categoryFreq).sort((a, b) => categoryFreq[b] - categoryFreq[a]);

  // 3. Query for recommendations
  let query = {
    _id: { $nin: joinedEventIds }, // Exclude already joined or waitlisted
    status: 'approved',
    date: { $gte: new Date().toISOString().split('T')[0] } // Upcoming only
  };

  if (preferredCategories.length > 0) {
    query.category = { $in: preferredCategories };
  }

  // 4. If no specific preferences, just get popular events
  let recommendations = await Event.find(query)
    .populate('createdBy', 'name')
    .limit(10);

  // Sort by category match priority then by participant count (popularity)
  recommendations.sort((a, b) => {
    const aIndex = preferredCategories.indexOf(a.category);
    const bIndex = preferredCategories.indexOf(b.category);

    if (aIndex !== bIndex) return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
    return (b.participants?.length || 0) - (a.participants?.length || 0);
  });

  res.json(recommendations.slice(0, 6)); // Return top 6
});

export {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  getEventParticipants,
  updateEventStatus,
  checkInUser,
  getRecommendations
};
