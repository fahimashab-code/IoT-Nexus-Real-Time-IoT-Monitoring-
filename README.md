# IoT Nexus — Real-Time IoT Monitoring Dashboard

Professional IoT dashboard starter built with the Next.js App Router. It includes a public marketing site, auth scaffolding, and a protected app area with device telemetry visualizations.

## Features

- App Router layouts for public, auth, and dashboard experiences.
- Fake auth gate with middleware protection for `/app/*`.
- Dashboard with Recharts time-series and configurable gauge cards.
- Device detail view with mock live telemetry and polling controls.
- Dark/light theme with Tailwind CSS tokens.
- Redux Toolkit for UI/session state and a mock-data service layer.

## Tech Stack

- Next.js (App Router) + TypeScript (strict)
- Tailwind CSS + shadcn/ui
- Redux Toolkit
- Recharts
- React Hook Form + Zod
- Lucide React icons

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

To access the protected app routes, use the dummy auth screen:
- Visit `http://localhost:3000/login`
- Any credentials are accepted; a demo cookie is set automatically.

## Routes

- `/` Landing page
- `/pricing`
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/mfa`
- `/app/dashboard`
- `/app/devices`
- `/app/devices/[deviceId]`
- `/app/alerts`
- `/app/settings`

## Gauge Controls

Each gauge card includes a 3-dot menu for settings:
- Range min/max
- Threshold colors and limits
- Reducer (last/avg/min/max/delta)
- Color mode (thresholds/value/neutral)
- Orientation (semi/full)
- No-data behavior
- Unit + decimals
- Display toggles and value mappings

## Project Structure

```
src/
  app/                # App Router routes + layouts
  components/         # UI and dashboard components
  config/             # Navigation and route constants
  lib/                # Auth, validators, gauge logic, utils
  services/           # Mock data providers
  store/              # Redux Toolkit store and slices
  types/              # Shared TypeScript types
```

## Scripts

- `npm run dev` Start dev server
- `npm run build` Production build
- `npm run start` Run production server
- `npm run lint` Lint check
