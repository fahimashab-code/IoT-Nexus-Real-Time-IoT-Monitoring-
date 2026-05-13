# IoT Nexus — Real-Time IoT Monitoring Dashboard

Professional IoT dashboard starter built with the Next.js App Router. It includes a public marketing site, auth scaffolding, and a protected app area with device telemetry visualizations.

## Features

- App Router layouts for public, auth, and dashboard experiences.
- Cognito auth flows with middleware protection for `/app/*`.
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

Set Cognito environment variables in `.env.local` before signing in:
- `NEXT_PUBLIC_COGNITO_USER_POOL_ID`
- `NEXT_PUBLIC_COGNITO_CLIENT_ID`
- `NEXT_PUBLIC_AWS_REGION`

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

## UI After Login

Once authenticated, users land in the app shell with a left sidebar + top bar layout.

### App Navigation

Sidebar items (from `appNav`):
- Dashboard — `/app/dashboard`
- Devices — `/app/devices`
- Alerts — `/app/alerts`
- Settings — `/app/settings`

Topbar elements:
- Search input (desktop only)
- Theme toggle
- User menu (profile + sign out)

### App Sections

- Dashboard: fleet health snapshot, KPI cards, charts, and recent alerts.
- Devices: fleet inventory table with an “Add device” dialog.
- Alerts: active alerts list with severity badges and timestamps.
- Settings: profile info (name/email), change password flow, and MFA management.

### Route Categories

- Public: `/`, `/pricing`
- Auth: `/login`, `/register`, `/verify`, `/forgot-password`, `/reset-password`, `/mfa`
- App (protected): `/app/*` routes listed above

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
