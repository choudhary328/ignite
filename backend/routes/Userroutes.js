import express from 'express';
const router = express.Router();
import {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  toggleUserStatus,
  toggleOrgVerification,
  loginAsUser,
  forgotPassword,
  resetPassword,
} from '../controllers/Usercontroller.js';
import { protect, admin } from '../middleware/Authmiddleware.js';
import upload from '../middleware/UploadMiddleware.js';

// --- Public Routes ---
router.post('/login', authUser);
router.post('/', registerUser); // Signup
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// --- Private Routes ---
router
  .route('/profile')
  .get(protect, getUserProfile) // Get profile
  .put(protect, upload.single('image'), updateUserProfile); // Update profile

// --- Admin Routes ---
router.get('/', protect, admin, getUsers); // Get all users
router.delete('/:id', protect, admin, deleteUser); // Delete a user
router.put('/:id/toggle-status', protect, admin, toggleUserStatus); // Toggle user status
router.put('/:id/toggle-verify', protect, admin, toggleOrgVerification); // Toggle org verification
router.post('/:id/impersonate', protect, admin, loginAsUser); // Impersonate user

export default router;
