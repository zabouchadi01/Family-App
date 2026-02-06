import { DEFAULT_API_URL } from '../config/constants';
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
import { getApiBaseUrl, saveApiBaseUrl } from './storage';

// Module-level cached URL for performance
let cachedApiUrl: string | null = null;

export async function initializeApiUrl(): Promise<string> {
  const storedUrl = await getApiBaseUrl();
  cachedApiUrl = storedUrl || DEFAULT_API_URL;
  return cachedApiUrl;
}

export async function setApiBaseUrl(url: string): Promise<void> {
  await saveApiBaseUrl(url);
  cachedApiUrl = url;
}

export function getConfiguredApiUrl(): string {
  return cachedApiUrl || DEFAULT_API_URL;
}

async function fetchApi<T>(endpoint: string): Promise<T> {
  const baseUrl = cachedApiUrl || DEFAULT_API_URL;
  const response = await fetch(`${baseUrl}${endpoint}`);

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
  const baseUrl = cachedApiUrl || DEFAULT_API_URL;
  return `${baseUrl}/api/auth/google`;
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
  const baseUrl = cachedApiUrl || DEFAULT_API_URL;
  const response = await fetch(`${baseUrl}/api/calendar/select`, {
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
  const baseUrl = cachedApiUrl || DEFAULT_API_URL;
  await fetch(`${baseUrl}/api/auth/logout`, { method: 'POST' });
}
