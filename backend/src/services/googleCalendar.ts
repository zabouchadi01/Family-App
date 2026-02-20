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

const MIN_EVENTS = 5;

function mapGoogleEvent(event: calendar_v3.Schema$Event): CalendarEvent {
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

function mergeAndDedup(
  existing: CalendarEvent[],
  incoming: CalendarEvent[],
): CalendarEvent[] {
  const seenIds = new Set(existing.map(e => e.id));
  const merged = [...existing];
  for (const event of incoming) {
    if (!seenIds.has(event.id)) {
      seenIds.add(event.id);
      merged.push(event);
    }
  }
  merged.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  return merged;
}

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

    // Step 1: Fetch events for the next 7 days
    const sevenDayPromises = calendarIds.map((calendarId) =>
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

    const sevenDayResponses = await Promise.all(sevenDayPromises);

    const allEvents: CalendarEvent[] = [];
    const seenEventIds = new Set<string>();

    for (const response of sevenDayResponses) {
      for (const event of (response.data.items || [])) {
        const mapped = mapGoogleEvent(event);
        if (!seenEventIds.has(mapped.id)) {
          seenEventIds.add(mapped.id);
          allEvents.push(mapped);
        }
      }
    }

    allEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    // Step 2: If fewer than MIN_EVENTS, fetch the next N events with no time cap
    let finalEvents = allEvents;

    if (allEvents.length < MIN_EVENTS) {
      console.log(`Only ${allEvents.length} events in 7-day window, fetching next ${MIN_EVENTS} events`);

      const extendedPromises = calendarIds.map((calendarId) =>
        calendar.events.list({
          calendarId,
          timeMin: now.toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
          maxResults: MIN_EVENTS,
        }).catch(error => {
          console.error(`Error fetching extended events from calendar ${calendarId}:`, error);
          return { data: { items: [] } };
        })
      );

      const extendedResponses = await Promise.all(extendedPromises);

      const extendedEvents: CalendarEvent[] = [];
      for (const response of extendedResponses) {
        for (const event of (response.data.items || [])) {
          extendedEvents.push(mapGoogleEvent(event));
        }
      }

      finalEvents = mergeAndDedup(allEvents, extendedEvents);
    }

    // Limit to 50 events total
    const limitedEvents = finalEvents.slice(0, 50);

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
