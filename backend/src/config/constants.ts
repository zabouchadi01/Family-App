export const HOME_ADDRESS = '39 Citron Knoll, Orinda, CA';

export const DESTINATIONS = [
  {
    name: 'Preschool',
    address: '5040 Mountain Blvd, Oakland, CA 94619',
  },
  {
    name: 'Gym',
    address: '1908 Olympic Blvd, Walnut Creek, CA 94596',
  },
  {
    name: 'Downtown',
    address: '1 Ferry Building, San Francisco, CA 94105',
  },
];

export const WEATHER_LOCATION = {
  lat: 37.8771,
  lon: -122.1797,
  name: 'Orinda, CA',
};

export const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes

export const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';

export const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache for API responses

// BART API Configuration
export const BART_API_KEY = 'MW9S-E7SL-26DU-VV8V'; // Public BART API key
export const BART_STATION = 'ORIN'; // Orinda station
export const BART_SF_DIRECTION = 'South'; // SF-bound trains from Orinda
export const BART_MAX_DEPARTURES = 4;
