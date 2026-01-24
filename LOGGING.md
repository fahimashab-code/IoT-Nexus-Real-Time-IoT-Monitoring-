# Logging system (Cognito + API)

This project logs client-side Cognito activity to the browser console and also persists
those logs to a text file in the project root so we can inspect them later.

## Where logs are saved
- File: `api-request-log.txt` (project root)
- Each line is JSON so it is easy to parse, grep, and compare.

## What is logged
From the client:
- Cognito requests and responses (sign up, confirm sign up, resend code, sign in, MFA, password reset, sign out)
- Basic request metadata (label, scope, time)

From the server:
- The `/api/log` endpoint appends each log record to `api-request-log.txt`

Sensitive values are redacted before being written:
- passwords, confirmation codes, tokens, secrets, authorization headers

## How it works
1) Client code calls `logClientEvent()` from `src/lib/logging.ts`
2) The log is printed to the browser console
3) The log is sent to `POST /api/log`
4) Server writes a JSON line into `api-request-log.txt`

## How to add new logs (systematic approach)
When you add a new API call:
1) Use a clear, consistent label: `service.action.request` / `service.action.response` / `service.action.error`
2) Include the `scope` (e.g. `cognito`, `api`, `billing`, `devices`)
3) Only log safe data; never include raw passwords or tokens
4) Use `logClientEvent({ label, scope, payload, level })`

Example:
```
await logClientEvent({
  label: "devices.fetch.request",
  scope: "api",
  payload: { deviceId },
});
```

## Notes
- This is for debugging. Consider disabling or limiting in production.
- File output requires a Node.js runtime (the API route uses `fs.appendFile`).
- Logs are disabled in production by default. You can control logging with:
  - `NEXT_PUBLIC_LOGGING_ENABLED=false` (disable all client logging)
  - `NEXT_PUBLIC_LOG_CONSOLE=false` (disable console logs)
  - `NEXT_PUBLIC_LOG_PERSIST=false` (disable POST /api/log)
