// API Configuration
// Update this to your backend server address
export const API_BASE_URL = 'http://10.0.2.2:3000'; // Android emulator localhost

// For physical device, use your machine's IP address:
// export const API_BASE_URL = 'http://192.168.1.xxx:3000';

// Refresh interval in milliseconds (15 minutes)
export const REFRESH_INTERVAL_MS = 15 * 60 * 1000;

// Cache keys
export const CACHE_KEYS = {
  CALENDAR_EVENTS: 'calendar_events',
  WEATHER_DATA: 'weather_data',
  DRIVE_TIMES: 'drive_times',
  LAST_REFRESH: 'last_refresh',
};
