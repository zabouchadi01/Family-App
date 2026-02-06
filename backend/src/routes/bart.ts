import { Router } from 'express';
import { getBartHandler } from '../controllers/bartController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/departures', asyncHandler(getBartHandler));

export default router;
