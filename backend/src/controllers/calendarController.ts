import { Request, Response } from 'express';
import { getUpcomingEvents, getCalendarList, saveSelectedCalendarIds } from '../services/googleCalendar';
import { enrichEventsWithImages } from '../services/eventImageService';

export async function getEvents(req: Request, res: Response): Promise<void> {
  try {
    const events = await getUpcomingEvents();

    // Enrich events with stock photo images (graceful — failures return events without images)
    let imageMap = new Map<string, any>();
    try {
      imageMap = await enrichEventsWithImages(events);
    } catch (err) {
      console.error('Image enrichment failed, returning events without images:', err);
    }

    const enrichedEvents = events.map(event => ({
      ...event,
      image: imageMap.get(event.id) || null,
    }));

    res.json({ events: enrichedEvents });
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
