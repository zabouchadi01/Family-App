import { Request, Response } from 'express';
import { getBartDepartures } from '../services/bart';

export async function getBartHandler(req: Request, res: Response): Promise<void> {
  try {
    const bartData = await getBartDepartures();
    res.json(bartData);
  } catch (error) {
    console.error('Error in BART controller:', error);
    res.status(500).json({ error: 'Failed to fetch BART departure data' });
  }
}
