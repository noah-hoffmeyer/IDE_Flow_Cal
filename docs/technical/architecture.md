# Technical Architecture

## Stack

- React 18
- Vite 4
- Plain CSS for styling
- Browser `localStorage` for persistence

## Application Structure

- `src/App.jsx` composes the main timeline calendar experience.
- `src/components/` contains modular UI and interaction components:
  - Timeline/day rendering
  - Task CRUD + edit modal
  - Category management modals
  - Month/year picker
  - Weather icon integration
- `src/styles/` contains focused component styles.

## Data Model (Client-Side)

The app stores user data in browser local storage. At a high level:

- Tasks keyed by day/date
- Categories with color metadata
- Ordering information for untimed tasks
- Completion and scheduling metadata for tasks

## Weather Integration

- Uses the US National Weather Service API (`api.weather.gov`).
- Pulls short-term forecast data for today and the next few days.
- Supports location from browser geolocation and/or manual coordinates.

## Deployment

- Frontend can be deployed as a static site.
- `vercel.json` provides deployment routing/config for Vercel.
