import { API_BASE_URL } from '../config/constants';
import {
  AuthStatus,
  Calendar,
  CalendarEvent,
  CalendarListResponse,
  CalendarResponse,
  CalendarSelectionResponse,
  DriveTime,
  DriveTimesResponse,
  WeatherData,
} from '../types';

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function checkAuthStatus(): Promise<AuthStatus> {
  return fetchApi<AuthStatus>('/api/auth/status');
}

export function getAuthUrl(): string {
  return `${API_BASE_URL}/api/auth/google`;
}

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const response = await fetchApi<CalendarResponse>('/api/calendar/events');
  return response.events;
}

export async function getWeather(): Promise<WeatherData> {
  return fetchApi<WeatherData>('/api/weather/current');
}

export async function getDriveTimes(): Promise<DriveTime[]> {
  const response = await fetchApi<DriveTimesResponse>('/api/maps/drive-times');
  return response.driveTimes;
}

export async function getCalendarList(): Promise<Calendar[]> {
  const response = await fetchApi<CalendarListResponse>('/api/calendar/list');
  return response.calendars;
}

export async function updateCalendarSelection(
  calendarIds: string[]
): Promise<CalendarSelectionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/calendar/select`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ calendarIds }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST' });
}
