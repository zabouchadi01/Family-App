# Family Calendar

An app built for the Abouchadi household. The motivation was to both build something useful that could improve our lifes every day + be a hands-on way to learn full-stack development, cloud deployment, and Android app distribution. It is not a generic app and is not designed to be reused out of the box, but the problems it solves and the engineering behind it are real.

The app runs on an Android tablet sitting on our kitchen table and acts as an always-on information screen. It shows:

- **Upcoming events** pulled live from Google Calendar — birthdays, appointments, school events, anything on the family calendar
- **Current weather** for your neighborhood, so you know what to wear before you leave
- **Drive times** to places you go regularly (work, school, gym) updated in real time via Google Maps
- **BART departures** for the nearest station, so you know exactly when to leave to catch your train
- **Grocery checklist** add and remove lists for the next costco trip directly from the app, synced to Google Tasks for access in Costco

---

## Technical overview

```
[Android Tablet]  ──HTTP──>  [Google Cloud VM]  ──>  [PostgreSQL]
                                    │                 [Google Calendar API]
                                    │                 [OpenWeatherMap API]
                                    │                 [Google Maps API]
                                    │                 [Unsplash API]
                                    │                 [Gemini API]
                                    │                 [BART API]
```

- **Frontend**: React Native (TypeScript), Android tablet
- **Backend**: Node.js + Express (TypeScript), hosted on Google Cloud
- **Database**: PostgreSQL
- **Auth**: Google OAuth 2.0, tokens stored in database

---

## Engineering highlights

Building this involved getting familiar and solving problems I had never encountered before:

### Cloud deployment at $0
The app is hosted in a Google Cloud e2-micro VM, calls Google Maps, Weather, Google Calendar, Gemini,...APIs every few minutes to refresh data. The entire app is designed to remain in the free tier of all APIs, so it is costing us $0 to run

### Google OAuth on a private network
Google OAuth does not accept raw IP addresses as redirect URIs. The workaround was to keep `localhost` as the registered redirect URI and establish an SSH tunnel from the PC to the VM during the one-time setup. The browser hits `localhost:3000`, the tunnel forwards it to the VM, and tokens are stored in PostgreSQL. After that, the tablet uses the stored tokens — no OAuth interaction needed again. It is pretty annoying to reset if I change my google password and the token is invalidated, but if you have done it before, it takes less than 5 minutes

---

## Product decision highlights

  - Designing the calendar view was challenging. Just the event names felt sterile, and not scannable. To improve it, I use event metadata (name, description, location), as input to an LLM, whose output is the ideal photo for that event. The photo is then associated with the event on the screen for better scannability
  - I kept it to the strict minimum that works for my family. This app only works for 1 tablet. If we wanted to scale this code to N users, there are several features (multi-tenant auth, user management, settings) that would have to be added. I built exactly what my family needs, nothing more.
  - I chose a swipeable N-page layout rather than cramming everything on one screen (which was my first instinct). Given this is displyaed on a 10inch tablet, the swipable multi-screen works best
  - Any users of the tablet can use the app without knowing anything about the tech (deployment, VMs, etc)
---

## Project structure

```
family-calendar/
├── mobile/                 # React Native app
│   └── src/
│       ├── components/     # CalendarWidget, WeatherWidget, DriveTimeWidget, BARTWidget
│       ├── screens/        # DashboardScreen, SettingsScreen
│       ├── services/       # API client, cache utilities
│       └── config/         # Constants (destinations, cache keys)
├── backend/
│   └── src/
│       ├── controllers/    # Route handlers
│       ├── services/       # Google Calendar, Weather, Maps, BART integrations
│       ├── routes/         # Express routes
│       └── db/migrations/  # PostgreSQL schema
├── deploy/                 # VM provisioning and deployment scripts
└── docker-compose.yml      # Local PostgreSQL setup
```

