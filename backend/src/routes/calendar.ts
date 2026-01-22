import { Router } from 'express';
import { getEvents, listCalendars, updateSelectedCalendars } from '../controllers/calendarController';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/events', requireAuth, asyncHandler(getEvents));
router.get('/list', requireAuth, asyncHandler(listCalendars));
router.post('/select', requireAuth, asyncHandler(updateSelectedCalendars));

export default router;
