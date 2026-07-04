import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // Import cors
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import connectDB from './config/db.js';
// import authRoutes from './routes/authRoutes.js'; // --- REMOVE THIS CONFLICTING ROUTE ---
import eventRoutes from './routes/Eventroutes.js';
import userRoutes from './routes/Userroutes.js';
import analyticsRoutes from './routes/AnalyticsRoutes.js'; // --- ADDED ---
import { notFound, errorHandler } from './middleware/errorMiddleware.js'; // Re-adding error handlers

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Serve uploaded files statically
// Backend local uploads folder (legacy)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Also serve files saved in the frontend public uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../frontend/public/uploads')));

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow this header
  })
);

// API Routes
// app.use('/api/auth', authRoutes); // --- REMOVE THIS LINE ---
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes); // This correctly handles login, register, and profile
app.use('/api/analytics', analyticsRoutes); // --- ADDED ---

// Root endpoint for testing
app.get('/', (req, res) => {
  res.send('Ignite API is running...');
});

// --- Error Handling Middleware ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
