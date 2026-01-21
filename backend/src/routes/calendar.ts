import { Router } from 'express';
import { getEvents } from '../controllers/calendarController';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/events', requireAuth, asyncHandler(getEvents));

export default router;
