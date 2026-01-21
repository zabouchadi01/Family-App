# Family Dashboard

A family dashboard application for Android tablets displaying upcoming Google Calendar events, current weather, and drive times to predefined destinations.

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

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Android SDK (for mobile development)
- Google Cloud Console project with Calendar API and Maps API enabled
- OpenWeatherMap API key

## Setup

### 1. Start the Database

```bash
docker-compose up -d
```

### 2. Configure Environment Variables

Copy the example environment file and fill in your API keys:

```bash
cp backend/.env.example backend/.env
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_REDIRECT_URI` - OAuth callback URL
- `OPENWEATHER_API_KEY` - OpenWeatherMap API key
- `GOOGLE_MAPS_API_KEY` - Google Maps API key

### 3. Setup Backend

```bash
cd backend
npm install
npm run migrate
npm run dev
```

The backend server will start on port 3000.

### 4. Setup Mobile App

```bash
cd mobile
npm install
npx react-native run-android
```

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

## Configuration

Edit `backend/src/config/constants.ts` to customize:
- Weather location coordinates
- Destination addresses for drive times
