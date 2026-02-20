// API Configuration
// Default URL for home network backend server
export const DEFAULT_API_URL = 'http://10.0.0.200:3000';

// Refresh interval in milliseconds (15 minutes)
export const REFRESH_INTERVAL_MS = 15 * 60 * 1000;

// BART refresh interval (5 minutes, independent from global refresh)
export const BART_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

// Cache keys
export const CACHE_KEYS = {
  CALENDAR_EVENTS: 'calendar_events',
  WEATHER_DATA: 'weather_data',
  DRIVE_TIMES: 'drive_times',
  BART_DATA: 'bart_data',
  GROCERY_LIST: 'grocery_list',
  LAST_REFRESH: 'last_refresh',
  API_BASE_URL: 'api_base_url',
};
