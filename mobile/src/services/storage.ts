import AsyncStorage from '@react-native-async-storage/async-storage';
import { CACHE_KEYS } from '../config/constants';
import { BartData, CalendarEvent, DriveTime, WeatherData } from '../types';

export async function cacheCalendarEvents(events: CalendarEvent[]): Promise<void> {
  await AsyncStorage.setItem(CACHE_KEYS.CALENDAR_EVENTS, JSON.stringify(events));
}

export async function getCachedCalendarEvents(): Promise<CalendarEvent[] | null> {
  const data = await AsyncStorage.getItem(CACHE_KEYS.CALENDAR_EVENTS);
  return data ? JSON.parse(data) : null;
}

export async function cacheWeatherData(weather: WeatherData): Promise<void> {
  await AsyncStorage.setItem(CACHE_KEYS.WEATHER_DATA, JSON.stringify(weather));
}

export async function getCachedWeatherData(): Promise<WeatherData | null> {
  const data = await AsyncStorage.getItem(CACHE_KEYS.WEATHER_DATA);
  return data ? JSON.parse(data) : null;
}

export async function cacheDriveTimes(driveTimes: DriveTime[]): Promise<void> {
  await AsyncStorage.setItem(CACHE_KEYS.DRIVE_TIMES, JSON.stringify(driveTimes));
}

export async function getCachedDriveTimes(): Promise<DriveTime[] | null> {
  const data = await AsyncStorage.getItem(CACHE_KEYS.DRIVE_TIMES);
  return data ? JSON.parse(data) : null;
}

export async function cacheBartData(data: BartData): Promise<void> {
  await AsyncStorage.setItem(CACHE_KEYS.BART_DATA, JSON.stringify(data));
}

export async function getCachedBartData(): Promise<BartData | null> {
  const data = await AsyncStorage.getItem(CACHE_KEYS.BART_DATA);
  return data ? JSON.parse(data) : null;
}

export async function setLastRefreshTime(time: Date): Promise<void> {
  await AsyncStorage.setItem(CACHE_KEYS.LAST_REFRESH, time.toISOString());
}

export async function getLastRefreshTime(): Promise<Date | null> {
  const data = await AsyncStorage.getItem(CACHE_KEYS.LAST_REFRESH);
  return data ? new Date(data) : null;
}

export async function clearAllCache(): Promise<void> {
  await AsyncStorage.multiRemove([
    CACHE_KEYS.CALENDAR_EVENTS,
    CACHE_KEYS.WEATHER_DATA,
    CACHE_KEYS.DRIVE_TIMES,
    CACHE_KEYS.BART_DATA,
    CACHE_KEYS.LAST_REFRESH,
  ]);
}

// API URL configuration
export async function saveApiBaseUrl(url: string): Promise<void> {
  await AsyncStorage.setItem(CACHE_KEYS.API_BASE_URL, url);
}

export async function getApiBaseUrl(): Promise<string | null> {
  return AsyncStorage.getItem(CACHE_KEYS.API_BASE_URL);
}
