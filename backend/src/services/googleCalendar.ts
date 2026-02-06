import { google, calendar_v3 } from 'googleapis';
import { getOAuth2Client, getValidToken } from './tokenManager';
import { CACHE_TTL_MS } from '../config/constants';
import { query } from '../db/connection';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  location?: string;
}

export interface Calendar {
  id: string;
  name: string;
  primary: boolean;
  backgroundColor?: string;
}

interface CachedResponse {
  data: CalendarEvent[];
  timestamp: number;
}

interface CachedCalendarList {
  data: Calendar[];
  timestamp: number;
}

const CALENDAR_LIST_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

let cachedEvents: CachedResponse | null = null;
let cachedCalendarList: CachedCalendarList | null = null;

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

    // Get selected calendar IDs from config
    const calendarIds = await getSelectedCalendarIds();

    // Fetch events from all selected calendars in parallel
    const eventPromises = calendarIds.map((calendarId) =>
      calendar.events.list({
        calendarId,
        timeMin: now.toISOString(),
        timeMax: sevenDaysLater.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 50,
      }).catch(error => {
        console.error(`Error fetching events from calendar ${calendarId}:`, error);
        return { data: { items: [] } };
      })
    );

    const responses = await Promise.all(eventPromises);

    // Merge all events from all calendars
    const allEvents: CalendarEvent[] = [];
    const seenEventIds = new Set<string>();

    for (const response of responses) {
      const events = (response.data.items || []).map(
        (event: calendar_v3.Schema$Event): CalendarEvent => {
          const isAllDay = !event.start?.dateTime;

          return {
            id: event.id || '',
            title: event.summary || 'Untitled Event',
            start: event.start?.dateTime || event.start?.date || '',
            end: event.end?.dateTime || event.end?.date || '',
            allDay: isAllDay,
            location: event.location || undefined,
          };
        }
      );

      // Add events, deduplicating by ID
      for (const event of events) {
        if (!seenEventIds.has(event.id)) {
          seenEventIds.add(event.id);
          allEvents.push(event);
        }
      }
    }

    // Sort by start time
    allEvents.sort((a, b) => {
      const aTime = new Date(a.start).getTime();
      const bTime = new Date(b.start).getTime();
      return aTime - bTime;
    });

    // Limit to 50 events total
    const limitedEvents = allEvents.slice(0, 50);

    // Cache the successful response
    cachedEvents = {
      data: limitedEvents,
      timestamp: Date.now(),
    };

    return limitedEvents;
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

export async function getCalendarList(): Promise<Calendar[]> {
  // Return cached data if still valid (24 hour cache)
  if (cachedCalendarList && Date.now() - cachedCalendarList.timestamp < CALENDAR_LIST_CACHE_TTL_MS) {
    console.log('Returning cached calendar list');
    return cachedCalendarList.data;
  }

  try {
    const accessToken = await getValidToken();
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const response = await calendar.calendarList.list({
      minAccessRole: 'reader',
      showHidden: false,
    });

    const calendars = (response.data.items || []).map(cal => ({
      id: cal.id || '',
      name: cal.summary || 'Untitled Calendar',
      primary: cal.primary || false,
      backgroundColor: cal.backgroundColor || undefined,
    }));

    // Cache the successful response
    cachedCalendarList = {
      data: calendars,
      timestamp: Date.now(),
    };

    return calendars;
  } catch (error) {
    console.error('Error fetching calendar list:', error);

    // Return cached data if available (even if stale)
    if (cachedCalendarList) {
      console.log('Returning stale cached calendar list due to error');
      return cachedCalendarList.data;
    }

    throw error;
  }
}

async function getSelectedCalendarIds(): Promise<string[]> {
  const result = await query<{ value: string }>(
    'SELECT value FROM config WHERE key = $1',
    ['selected_calendars']
  );

  if (result.rows.length === 0) {
    return ['primary']; // Default fallback
  }

  return JSON.parse(result.rows[0].value);
}

export async function saveSelectedCalendarIds(calendarIds: string[]): Promise<void> {
  await query(
    `INSERT INTO config (key, value, updated_at)
     VALUES ($1, $2, CURRENT_TIMESTAMP)
     ON CONFLICT (key) DO UPDATE
     SET value = $2, updated_at = CURRENT_TIMESTAMP`,
    ['selected_calendars', JSON.stringify(calendarIds)]
  );

  // Invalidate cache when selection changes
  cachedEvents = null;
}
