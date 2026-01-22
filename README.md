# Family Dashboard

A family dashboard application for Android tablets displaying upcoming Google Calendar events, current weather, and drive times to predefined destinations.

## Security Notice

This repository does NOT include API credentials. You'll need to obtain your own:

- **Google OAuth 2.0 credentials** - For Google Calendar access
- **OpenWeatherMap API key** - For weather data
- **Google Maps API key** - For drive time calculations

See Setup section below for details.

## Features

- **Calendar Events**: View upcoming events from Google Calendar (next 7 days)
- **Weather**: Current weather conditions for configured location
- **Drive Times**: Real-time drive times to predefined destinations
- **Auto-refresh**: Data refreshes every 15 minutes

## Technology Stack

- **Frontend**: React Native (TypeScript) - Android tablet app
- **Backend**: Node.js with Express (TypeScript)
- **Database**: PostgreSQL (via Docker)
- **External APIs**: Google Calendar API, OpenWeatherMap API, Google Maps Distance Matrix API

## Setup

### 1. Prerequisites

- Node.js 18+
- PostgreSQL (via Docker)
- Android development environment
- Google Cloud account
- OpenWeatherMap account

### 2. Get API Credentials

#### Google OAuth (Calendar Access)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable **Google Calendar API**: APIs & Services → Library → "Google Calendar API" → Enable
4. Create credentials: APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
5. Application type: Web application
6. Authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
7. Save Client ID and Client Secret

#### OpenWeatherMap API

1. Register at [OpenWeatherMap](https://openweathermap.org/api)
2. Subscribe to free tier
3. Copy API key from account dashboard

#### Google Maps API (Optional - for drive times)

1. In same Google Cloud project
2. Enable **Distance Matrix API**: APIs & Services → Library → "Distance Matrix API" → Enable
3. Create API key: APIs & Services → Credentials → Create Credentials → API Key
4. Add restrictions: HTTP referrers (optional), API restrictions (Distance Matrix only)

### 3. Configure Environment

```bash
cd "Family Calendar/backend"
cp .env.example .env
```

Edit `backend/.env` with your credentials:

```env
# Paste your Google OAuth credentials
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# Paste your OpenWeatherMap API key
OPENWEATHER_API_KEY=your_api_key_here

# Optional: Add Google Maps API key
GOOGLE_MAPS_API_KEY=your_maps_key_here
```

### 4. Start Backend

```bash
# Start PostgreSQL
cd "Family Calendar"
docker-compose up -d

# Run migrations
cd backend
npm install
npm run migrate

# Start server
npm run dev
```

Server runs on http://localhost:3000

### 5. Start Mobile App

```bash
cd "Family Calendar/mobile"
npm install
npx react-native run-android
```

### 6. Authenticate

1. Open app on Android device/emulator
2. Navigate to Settings
3. Tap "Connect Google Calendar"
4. Complete OAuth flow in browser
5. Return to app

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `GET /api/auth/google` | Initiate Google OAuth flow |
| `GET /api/auth/google/callback` | OAuth callback handler |
| `GET /api/auth/status` | Check authentication status |
| `GET /api/calendar/events` | Fetch calendar events (requires auth) |
| `GET /api/weather/current` | Get current weather |
| `GET /api/maps/drive-times` | Get drive times to destinations |

## Project Structure

```
family-dashboard/
├── mobile/                 # React Native app
│   └── src/
│       ├── components/     # CalendarWidget, WeatherWidget, DriveTimeWidget
│       ├── screens/        # DashboardScreen, SettingsScreen
│       ├── services/       # API client, storage utilities
│       └── config/         # Constants
├── backend/
│   └── src/
│       ├── controllers/    # Route handlers
│       ├── services/       # External API integrations
│       ├── routes/         # Express routes
│       ├── middleware/     # Auth, error handling
│       └── db/             # Database connection and migrations
└── docker-compose.yml      # PostgreSQL setup
```

## Troubleshooting

**"OAuth error: redirect_uri_mismatch"**
- Verify redirect URI in Google Cloud Console exactly matches: `http://localhost:3000/api/auth/google/callback`

**"API key invalid" (OpenWeatherMap)**
- Wait 10 minutes after creating key (activation delay)
- Verify key is active in OpenWeatherMap dashboard

**Database connection failed**
- Check Docker container is running: `docker ps`
- Verify DATABASE_URL in .env matches docker-compose.yml

## Configuration

Edit `backend/src/config/constants.ts` to customize:
- Weather location coordinates
- Destination addresses for drive times
