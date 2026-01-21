import { Router } from 'express';
import { getWeather } from '../controllers/weatherController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/current', asyncHandler(getWeather));

export default router;
