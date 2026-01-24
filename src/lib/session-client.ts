"use client";

import { SESSION_COOKIE } from "@/lib/auth-constants";

const SESSION_MAX_AGE_SECONDS = 60 * 60;

export function setSessionCookie(token: string) {
  if (typeof document === "undefined") return;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? " secure;" : "";
  document.cookie = `${SESSION_COOKIE}=${token}; path=/; max-age=${SESSION_MAX_AGE_SECONDS}; samesite=lax;${secure}`;
}

export function clearSessionCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; samesite=lax;`;
}
