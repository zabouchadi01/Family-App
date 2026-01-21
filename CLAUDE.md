# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Family dashboard application for Android tablet displaying:
- Upcoming events from Google Calendar
- Current weather for a configured location
- Drive times to predefined destinations

Data refreshes every 15 minutes via polling.

## Technology Stack

- **Frontend**: React Native (TypeScript) - Android tablet app
- **Backend**: Node.js with Express (TypeScript)
- **Database**: PostgreSQL (via Docker)
- **External APIs**: Google Calendar API, OpenWeatherMap API, Google Maps Distance Matrix API

## Project Structure

```
family-dashboard/
├── mobile/                 # React Native app
│   └── src/
│       ├── components/     # CalendarWidget, WeatherWidget, DriveTimeWidget
│       ├── screens/        # DashboardScreen, SettingsScreen
│       ├── services/       # API client, storage utilities
│       └── config/         # Constants (destinations, etc.)
├── backend/
│   └── src/
│       ├── controllers/    # auth, calendar, weather, maps
│       ├── services/       # External API integrations, token management
│       ├── routes/         # Express routes
│       └── db/migrations/  # PostgreSQL schema
└── docker-compose.yml      # PostgreSQL setup
```

## Build and Run Commands

### Backend
```bash
cd backend
npm install
npm run migrate      # Run database migrations
npm run dev          # Start development server (port 3000)
```

### Frontend
```bash
cd mobile
npm install
npx react-native run-android   # Build and run on Android device/emulator
```

### Database
```bash
docker-compose up -d   # Start PostgreSQL container
```

## Architecture

```
[React Native App] → [Backend API Server] → [PostgreSQL]
                                          → [Google Calendar API]
                                          → [OpenWeatherMap API]
                                          → [Google Maps Distance Matrix API]
```

The backend acts as a proxy for all external APIs to keep API keys secure. OAuth tokens are stored in PostgreSQL.

## Key API Endpoints

- `GET /api/auth/google` - Initiate Google OAuth flow
- `GET /api/auth/google/callback` - OAuth callback handler
- `GET /api/auth/status` - Check authentication status
- `GET /api/calendar/events` - Fetch next 7 days of events
- `GET /api/weather/current` - Current weather for configured location
- `GET /api/maps/drive-times` - Drive times to all configured destinations

## Database Schema

Two main tables:
- `auth_tokens` - Stores Google OAuth access/refresh tokens (single-user app)
- `config` - Key-value store for settings (weather_location, refresh_interval)

## Environment Variables (Backend)

Required in `backend/.env`:
- `DATABASE_URL` - PostgreSQL connection string
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` - OAuth credentials
- `OPENWEATHER_API_KEY` - OpenWeatherMap API key
- `GOOGLE_MAPS_API_KEY` - Google Maps API key
- `PORT`, `NODE_ENV`, `FRONTEND_URL`

## Implementation Notes

- Token refresh logic: Check if token expires within 5 minutes before each Google API call
- Calendar scope: `https://www.googleapis.com/auth/calendar.readonly`
- All external API calls must go through the backend (never expose keys in frontend)
- Cache last successful response for each data source to handle API failures gracefully
- Destinations and weather location are hardcoded in `backend/src/config/constants.ts`
