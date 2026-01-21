import { Request, Response } from 'express';
import { getUpcomingEvents } from '../services/googleCalendar';

export async function getEvents(req: Request, res: Response): Promise<void> {
  try {
    const events = await getUpcomingEvents();
    res.json({ events });
  } catch (error) {
    console.error('Error in calendar controller:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
}
