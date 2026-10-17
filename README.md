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

## MATLAB simulation stage

Start with [motor basics and lesson 01](docs/matlab/01-motor-basics.md), then follow the [MATLAB run instructions](simulation/matlab/README.md). Keep the [learning journal](docs/matlab/learning-journal.md) as the ongoing record for the portfolio and a future blog.

A [readable Word copy of session 01](docs/matlab/IoT%20Nexus%20MATLAB%20Learning%20Journal.docx) includes the concepts, equations, model diagram, plots and recorded results. The Markdown journal is the ongoing source record.

The first lesson builds an editable DC motor model in Simulink, compares fixed-voltage runs with and without an added shaft load, and saves plots, CSV recordings and validation results. Its motor parameters are explicit teaching assumptions. This stage requires no hardware purchase and does not change the website's illustrative response generator.

## Development direction

1. Understand and check the simulated motor's current, torque and speed.
2. Compare the equation model with a Simscape Electrical circuit.
3. Add speed control and evaluate load-disturbance recovery.
4. Add reproducible monitoring experiments and import their recordings into Nexus.
5. Consider physical validation later if useful; select hardware only after revisiting that decision.

## Source

```text
src/app/                   Pages and global visual styles
src/components/bench/      Shared demo state, motor illustration, measurement chart
src/components/layout/     Workspace navigation and shell
src/lib/bench-model.ts     Demo types, response generator, CSV export
src/lib/bench-storage.ts   Validated local settings and experiment storage
simulation/matlab/        Reproducible motor model and experiment recordings
docs/matlab/              Motor concepts and ongoing learning journal
```
