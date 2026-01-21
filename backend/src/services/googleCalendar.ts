import { google, calendar_v3 } from 'googleapis';
import { getOAuth2Client, getValidToken } from './tokenManager';
import { CACHE_TTL_MS } from '../config/constants';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  location?: string;
}

interface CachedResponse {
  data: CalendarEvent[];
  timestamp: number;
}

let cachedEvents: CachedResponse | null = null;

export async function getUpcomingEvents(): Promise<CalendarEvent[]> {
  // Return cached data if still valid
  if (cachedEvents && Date.now() - cachedEvents.timestamp < CACHE_TTL_MS) {
    console.log('Returning cached calendar events');
    return cachedEvents.data;
  }

  try {
    const accessToken = await getValidToken();
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: sevenDaysLater.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 50,
    });

    const events = (response.data.items || []).map(
      (event: calendar_v3.Schema$Event): CalendarEvent => {
        const isAllDay = !event.start?.dateTime;

        return {
          id: event.id || '',
          title: event.summary || 'Untitled Event',
          start: event.start?.dateTime || event.start?.date || '',
          end: event.end?.dateTime || event.end?.date || '',
          allDay: isAllDay,
          location: event.location,
        };
      }
    );

    // Cache the successful response
    cachedEvents = {
      data: events,
      timestamp: Date.now(),
    };

    return events;
  } catch (error) {
    console.error('Error fetching calendar events:', error);

    // Return cached data if available (even if stale)
    if (cachedEvents) {
      console.log('Returning stale cached calendar events due to error');
      return cachedEvents.data;
    }

    throw error;
  }
}
