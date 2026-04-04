# Setup Guide

## Prerequisites

- Node.js 18+ (recommended)
- npm 9+ (or bundled npm with your Node install)

## Local Development

1. Install dependencies:
   ```bash
   cd app
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Open the app in your browser at:
   - `http://localhost:5173`

## Production Build

From `app/`:

```bash
npm run build
npm run preview
```

## Environment & Data Notes

- Task and category data are persisted in browser `localStorage`.
- Weather data is fetched from `https://api.weather.gov`.
- No backend services or database are required for local usage.
