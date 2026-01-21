import { API_BASE_URL } from '../config/constants';
import {
  AuthStatus,
  CalendarEvent,
  CalendarResponse,
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

export async function logout(): Promise<void> {
  await fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST' });
}
