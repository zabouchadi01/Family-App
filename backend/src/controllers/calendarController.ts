import { Request, Response } from 'express';
import { getUpcomingEvents, getCalendarList, saveSelectedCalendarIds } from '../services/googleCalendar';

export async function getEvents(req: Request, res: Response): Promise<void> {
  try {
    const events = await getUpcomingEvents();
    res.json({ events });
  } catch (error) {
    console.error('Error in calendar controller:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
}

export async function listCalendars(req: Request, res: Response): Promise<void> {
  try {
    const calendars = await getCalendarList();
    res.json({ calendars });
  } catch (error) {
    console.error('Error listing calendars:', error);
    res.status(500).json({ error: 'Failed to fetch calendar list' });
  }
}

export async function updateSelectedCalendars(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { calendarIds } = req.body;

    if (!Array.isArray(calendarIds)) {
      res.status(400).json({ error: 'calendarIds must be an array' });
      return;
    }

    if (!calendarIds.every(id => typeof id === 'string')) {
      res.status(400).json({ error: 'All calendar IDs must be strings' });
      return;
    }

    await saveSelectedCalendarIds(calendarIds);
    res.json({ success: true, message: 'Calendar selection updated' });
  } catch (error) {
    console.error('Error updating calendar selection:', error);
    res.status(500).json({ error: 'Failed to update calendar selection' });
  }
}
