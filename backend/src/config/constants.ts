export const DESTINATIONS = [
  {
    name: 'Work',
    address: '123 Business Ave, City, State 12345',
  },
  {
    name: 'School',
    address: '456 Education Blvd, City, State 12345',
  },
  {
    name: 'Gym',
    address: '789 Fitness Way, City, State 12345',
  },
];

export const WEATHER_LOCATION = {
  lat: 40.7128,
  lon: -74.0060,
  name: 'New York, NY',
};

export const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes

export const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';

export const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache for API responses
