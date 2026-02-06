import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import calendarRoutes from './routes/calendar';
import weatherRoutes from './routes/weather';
import mapsRoutes from './routes/maps';

const app = express();

// Middleware
// Allow all origins in development/home network (single-user app)
app.use(cors({
  origin: true, // Reflects the request origin, allowing any origin
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/maps', mapsRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
});
