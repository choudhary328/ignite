import express from 'express';
import { sendContactMessage } from '../controllers/Contactcontroller.js';

const router = express.Router();

// Public endpoint for contact form submissions
router.post('/', sendContactMessage);

export default router;
