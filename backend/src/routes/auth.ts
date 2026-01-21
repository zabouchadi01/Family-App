import { Router } from 'express';
import {
  initiateGoogleAuth,
  handleGoogleCallback,
  getAuthStatus,
  logout,
} from '../controllers/authController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/google', initiateGoogleAuth);
router.get('/google/callback', asyncHandler(handleGoogleCallback));
router.get('/status', asyncHandler(getAuthStatus));
router.post('/logout', asyncHandler(logout));

export default router;
