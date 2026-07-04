import express from 'express';
import { protect, admin } from '../middleware/AuthMiddleware.js';
import { getDashboardStats } from '../controllers/AnalyticsController.js';

const router = express.Router();

router.get('/stats', protect, admin, getDashboardStats);

export default router;
