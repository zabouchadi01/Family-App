import { Request, Response, NextFunction } from 'express';
import { isAuthenticated } from '../services/tokenManager';
import { createError } from './errorHandler';

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      throw createError('Authentication required', 401);
    }

    next();
  } catch (error) {
    next(error);
  }
}
