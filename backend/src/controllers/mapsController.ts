import { Request, Response } from 'express';
import { getDriveTimes } from '../services/maps';

export async function getDriveTimesHandler(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const driveTimes = await getDriveTimes();
    res.json({ driveTimes });
  } catch (error) {
    console.error('Error in maps controller:', error);
    res.status(500).json({ error: 'Failed to fetch drive times' });
  }
}
