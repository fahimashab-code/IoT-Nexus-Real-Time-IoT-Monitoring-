type LogLevel = "info" | "warn" | "error";

type LogEvent = {
  label: string;
  scope: string;
  level?: LogLevel;
  payload?: unknown;
};

const SENSITIVE_KEYS = new Set(
  [
    "password",
    "oldpassword",
    "newpassword",
    "confirmpassword",
    "secret",
    "clientsecret",
    "secretHash",
    "token",
    "idtoken",
    "accesstoken",
    "refreshtoken",
    "authorization",
    "code",
    "confirmationcode",
    "verificationcode",
    "otp",
    "totp",
    "mfacode",
    "challengeresponse",
  ].map((key) => key.toLowerCase()),
);

const LOGGING_ENABLED = process.env.NEXT_PUBLIC_LOGGING_ENABLED !== "false";
const CONSOLE_LOGS_ENABLED = process.env.NEXT_PUBLIC_LOG_CONSOLE !== "false";
const PERSIST_LOGS_ENABLED =
  process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_LOG_PERSIST !== "false";

function redactSensitive(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redactSensitive);
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    return Object.fromEntries(
      entries.map(([key, val]) => {
        const normalized = key.toLowerCase();
        return [key, SENSITIVE_KEYS.has(normalized) ? "[REDACTED]" : redactSensitive(val)];
      }),
    );
  }

  return value;
}

export async function logClientEvent({ label, scope, level = "info", payload }: LogEvent) {
  if (!LOGGING_ENABLED) return;

  const safePayload = redactSensitive(payload);

  const consolePayload = {
    label,
    scope,
    level,
    payload: safePayload,
    at: new Date().toISOString(),
  };

  if (CONSOLE_LOGS_ENABLED) {
    if (level === "error") {
      console.error(consolePayload);
    } else if (level === "warn") {
      console.warn(consolePayload);
    } else {
      console.log(consolePayload);
    }
  }

  try {
    if (!PERSIST_LOGS_ENABLED) return;
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const blob = new Blob([JSON.stringify(consolePayload)], { type: "application/json" });
      navigator.sendBeacon("/api/log", blob);
      return;
    }
    await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(consolePayload),
    });
  } catch (error) {
    console.warn({
      label: "log.send.failed",
      scope: "client",
      level: "warn",
      payload: { message: (error as Error)?.message ?? "Unknown error" },
    });
  }
}
