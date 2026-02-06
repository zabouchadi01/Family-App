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
- **Calendar widget shows empty if no events in next 7 days** - this is by design, not a bug

## Deployment to Physical Tablet

### Critical Network Configuration

1. **Windows Network Profile Must Be "Private"**
   - Public networks block all incoming connections by default
   - Change: Settings → Network & Internet → Wi-Fi → [Network Name] → Network profile type → Private
   - Without this, tablet cannot connect even with firewall rules configured

2. **Firewall Configuration**
   - Port 3000 must be open for incoming connections
   - Run as admin: `netsh advfirewall firewall add rule name="Family Calendar API" dir=in action=allow protocol=TCP localport=3000`
   - Verify: `netsh advfirewall firewall show rule name="Family Calendar API"`

3. **Static IP for Backend Server**
   - PC needs static IP for reliable tablet connections
   - Options: Router DHCP reservation (recommended) or Windows static IP
   - Current setup: 10.0.0.200 on home network

4. **Network Connectivity Troubleshooting**
   - Test backend health: `http://SERVER_IP:3000/health` from both PC and tablet browser
   - Verify devices on same subnet (both should have 10.0.0.x IPs)
   - If tablet can't connect: Check network profile first, then firewall rules

### OAuth Flow for IP-Based Deployments

**Google OAuth Limitation**: Google does not allow IP addresses (e.g., `http://10.0.0.200:3000`) as OAuth redirect URIs - only domains with public TLDs.

**Workaround Solution**:
- Backend uses `http://localhost:3000/api/auth/google/callback` as redirect URI
- Initial OAuth sign-in performed from **PC's browser** at `http://localhost:3000/api/auth/setup`
- OAuth tokens stored in PostgreSQL database (shared between PC and tablet)
- Tablet uses stored tokens to fetch data - no separate OAuth needed
- Backend callback handler detects user-agent and redirects to app (`familycalendar://`) or shows web success page

**Setup Page**: `GET /api/auth/setup` - Friendly web page for initial OAuth from PC

### Android Build Types

**Debug Build** (58 MB):
- Requires Metro bundler running during development
- Tries to connect to Metro at runtime to load JavaScript
- Error "Unable to load script" means Metro is not running
- Not suitable for deployment

**Release Build** (25 MB, 57% smaller):
- JavaScript bundled into APK (no Metro needed)
- Minified and optimized (ProGuard/R8)
- Build command: `cd android && ./gradlew assembleRelease`
- Requires keystore configuration

**Standalone Debug Build** (for testing without Metro):
1. Bundle JS: `npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res`
2. Build: `cd android && ./gradlew assembleDebug`
3. Result: Debug APK with bundled JavaScript (no Metro dependency)

### Keystore Configuration

**Critical**: Keystore file must be in `android/app/` directory, NOT `android/` directory
- Gradle reads `keystore.properties` relative to app module
- Error "Keystore file not found" = wrong directory
- Correct path: `android/app/family-calendar.keystore`
- Generate: `keytool -genkeypair -v -storetype PKCS12 -keystore family-calendar.keystore -alias family-calendar -keyalg RSA -keysize 2048 -validity 10000`

### Settings Access UX Fix

**Original Implementation**: Hidden long-press on "Upcoming Events" label (5 seconds)
- Poor discoverability, unreliable touch detection
- Users cannot find settings

**Fixed Implementation**: Visible settings gear icon in dashboard header
- Added header bar with "Family Calendar" title and settings icon
- File: `mobile/src/screens/DashboardScreen.tsx`
- Always provide visible UI for critical settings, never rely on hidden gestures

### Backend Configuration for Network Access

**Dynamic API URL in Mobile App**:
- Settings screen allows runtime URL configuration
- Stored in AsyncStorage: `CACHE_KEYS.API_BASE_URL`
- Default: `http://10.0.2.2:3000` (Android emulator)
- Production: `http://10.0.0.200:3000` (or server's LAN IP)

**CORS Configuration**:
- Development: Allow all origins (`origin: true`)
- Single-user home app: No CORS restrictions needed
- File: `backend/src/index.ts`

**Database Network Binding**:
- PostgreSQL must bind to `0.0.0.0:5432` not `127.0.0.1:5432`
- Docker compose: `ports: "0.0.0.0:5432:5432"`
- Allows backend to connect from PC's network IP

### Common Deployment Issues

| Issue | Diagnosis | Solution |
|-------|-----------|----------|
| Tablet can't connect to backend | Test `http://SERVER_IP:3000/health` in tablet browser | 1. Change network to Private<br>2. Add firewall rule for port 3000<br>3. Verify same subnet |
| "Unable to load script" on app launch | Debug APK without Metro running | Build release APK or bundle JS into debug APK |
| Empty calendar widget | Check Google Calendar for events in next 7 days | App only shows next 7 days by design - add events if needed |
| OAuth "Invalid redirect URI" | Google doesn't allow IP-based URIs | Use PC browser at localhost:3000/api/auth/setup |
| "Keystore file not found" | Keystore in wrong directory | Move to `android/app/` not `android/` |
| Settings not accessible | Hidden long-press not working | Use visible settings gear icon (fixed) |

### Production Checklist

- [ ] PC has static IP configured
- [ ] Network profile set to "Private"
- [ ] Firewall rule added for port 3000
- [ ] PostgreSQL running with network binding
- [ ] Backend .env updated with server IP
- [ ] Google OAuth done from PC browser
- [ ] Release APK built and signed
- [ ] Backend URL configured in tablet app settings
- [ ] Test all three widgets load data
