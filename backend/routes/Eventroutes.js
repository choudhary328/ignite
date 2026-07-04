import express from 'express';
import {
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
  getRecommendations,
} from '../controllers/Eventcontroller.js';
import { getCommentsByEvent, postComment } from '../controllers/CommentController.js';
import { protect, optionalProtect, orgAdmin, superAdmin } from '../middleware/Authmiddleware.js';
import upload from '../middleware/UploadMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(optionalProtect, getAllEvents)
  .post(protect, orgAdmin, upload.single('image'), createEvent);

router.get('/recommendations', protect, getRecommendations);

router.get('/:id/participants', protect, orgAdmin, getEventParticipants);
router.put('/:id/status', protect, superAdmin, updateEventStatus);
router.put('/:id/checkin', protect, orgAdmin, checkInUser);

// --- COMMENT ROUTES ---
router.get('/:id/comments', protect, getCommentsByEvent);
router.post('/:id/comments', protect, postComment);

router
  .route('/:id')
  .get(getEventById)
  .put(protect, orgAdmin, upload.single('image'), updateEvent)
  .delete(protect, orgAdmin, deleteEvent);

router.put('/:id/join', protect, joinEvent);
router.put('/:id/leave', protect, leaveEvent);

export default router;