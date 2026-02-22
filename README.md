# Family Calendar

I built this for my family. Not as a side project to collect dust, but as something we actually use every day. This is an app running on a tablet mounted in our kitchen that keeps the whole household in sync without anyone having to think about it.

The deeper motivation was to get hands-on with the full stack: product definition, frontend, backend, database, cloud deployment, and Android distribution. Every decision in this project — technical or product — was mine to make. It was also a great way to get really chummy with Claude Code.

---

## The problem it solves

We ran a busy household. Between commute, daycare, groceries, etc. everyone is trying to answer the same questions at the same time: what events are on the shared calendar for the next week, do I need an umbrella, is the train delayed, do we need to pick something up at Costco? The answer used to be scattered across N apps and two people's phones.

This app puts all of it on one screen, always on, always up to date, visible to the whole family at a glance while having breakfast. 

---

## What it shows

- **Upcoming events** — pulled live from Google Calendar. Birthdays, school pickups, playdates, appointments, anything the family has scheduled
- **Current weather** — so you know what to wear before you open the front door
- **Drive times** — real-time estimates to the places we go most (work, daycare, gym), powered by Google Maps
- **BART departures** — live transit times from our nearest station, so we know exactly when to leave to catch the train
- **Grocery checklist** — add and check off items directly on the tablet, synced to Google Tasks so the list is also on your phone at the store

Everything refreshes automatically. No one in the family needs to know it runs on a cloud VM.

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

## Product decision highlights

These are the decisions I'm most proud of — not because they were technically hard, but because they required stepping back and thinking about the person actually using the app.

**The calendar felt sterile, so I added AI-generated context photos**
A list of event names is technically correct but hard to scan at a glance and from a distance. I wanted the app to convey info even if the user is not necessarily holding it in their hands, for instance by looking at it from across the room. I added a step where each event's name, description, and location are sent to an LLM, which returns the ideal search query for a contextually relevant photo. The photo appears alongside the event on screen. The calendar went from a text list to something you can parse in two seconds from across the room.

**I resisted scope creep deliberately**
This app works for exactly one household and one tablet. There is no multi-user auth, no settings dashboard, no admin panel. I was really tempted to make this an actual app on the app store, but decided against it. Those would have been easy to justify and a waste of time to build. I scoped to what the family actually needs, shipped it, and moved on.

**I chose a swipeable multi-page layout over a single dense screen**
The first version tried to show everything at once. It looked like a sales dashboard. I switched to a swipeable layout — calendar on one page, groceries on another, etc. — which made each screen breathable and gave each widget the space it deserved.

---

## Engineering highlights

Building this meant encountering and solving problems I had never dealt with before. Claude Code was invaluable in brainstorming how to resolve these challenges;

**Cloud deployment at $0**
The backend runs on a Google Cloud e2-micro VM (free tier). It hits Google Maps, OpenWeatherMap, Google Calendar, Gemini, and the BART API every few minutes. The whole thing is designed to stay within the free tier of every service. Total monthly cost: $0.

**Google OAuth on a cloud VM with no domain name**
Google OAuth refuses to accept raw IP addresses as redirect URIs — only real domains. The backend runs on an IP, with no domain attached. The workaround: keep `localhost` as the registered redirect URI, and use an SSH tunnel during the one-time setup so the browser's OAuth callback routes through `localhost` and arrives at the VM. Tokens are stored in PostgreSQL. The tablet reads from those tokens forever after, with no OAuth interaction needed again.

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

