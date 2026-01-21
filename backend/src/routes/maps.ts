import { Router } from 'express';
import { getDriveTimesHandler } from '../controllers/mapsController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/drive-times', asyncHandler(getDriveTimesHandler));

export default router;
