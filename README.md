# IoT Nexus — Embedded Motor Laboratory

A focused, account-free workspace for a motor-control and fault-detection portfolio project. Built with Next.js 16, React 19, TypeScript, Recharts, and Lucide icons.

## Current scope

- **Test bench (`/`)**: an illustrative motor layout, requested-speed control, selectable demo conditions, four sensor readings, a measurement chart, and session activity.
- **Experiments (`/experiments`)**: review recorded demo runs and export their samples as CSV.
- **Device settings (`/settings`)**: configure the bench name, demo speed range, sample interval, and warning thresholds.

All measurements are explicitly **simulated**. Run demo starts the local simulation. Stop & save stops generation and saves the captured samples in browser storage. Each run is capped at 1,200 samples; reaching that cap stops and saves it automatically. The latest 12 runs are retained. Export runs to preserve them beyond browser storage or eviction. Refreshing or closing the page ends an active, unsaved run.

The response generator is an illustrative UI model, not an identified physical motor model or evidence of a working controller. The demo has no ESP32 connection, MQTT backend, physical motor actuation, or trained fault-detection model. Warning thresholds only affect the demo display.

## Run locally

```sh
npm install
npm run dev
```

Open `http://localhost:3000`. No account, Cognito configuration, or AWS credentials are required.

```sh
npm run lint
npm run build
npm run start
```

Existing webpack and Turbopack scripts are preserved. The site uses system fonts and does not need to download fonts during a build.

## Authentication removal

Login, registration, verification, password reset, MFA, account settings, auth providers, session endpoints, and authentication middleware have been removed from the application. Old `/app/*` bookmarks redirect to the simplified workspace. Removed authentication and pricing URLs return a normal 404.

The historical Terraform files in `infra/` are retained for reference and are not used by this application. No infrastructure has been applied or destroyed. Do not apply that folder to run the demo.

## Next hardware stage

1. Implement and validate ESP32 sensing and local motor control.
2. Add a device connection and durable measurement storage.
3. Require device acknowledgements before showing a physical command as applied.
4. Keep local limits and protective behaviour on the device.
5. Evaluate fault-detection methods with recorded physical experiments.

## Source

```text
src/app/                   Pages and global visual styles
src/components/bench/      Shared demo state, motor illustration, measurement chart
src/components/layout/     Workspace navigation and shell
src/lib/bench-model.ts     Demo types, response generator, CSV export
src/lib/bench-storage.ts   Validated local settings and experiment storage
```
