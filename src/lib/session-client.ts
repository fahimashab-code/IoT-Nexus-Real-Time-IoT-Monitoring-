"use client";

const SESSION_ENDPOINT = "/api/auth/session";

async function callSessionEndpoint(method: "POST" | "DELETE", token?: string) {
  if (typeof window === "undefined") return;
  try {
    const response = await fetch(SESSION_ENDPOINT, {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: token ? JSON.stringify({ token }) : undefined,
    });

    if (!response.ok) {
      console.warn("Session endpoint failed", { status: response.status });
    }
  } catch (error) {
    console.warn("Session endpoint error", { message: (error as Error)?.message ?? "Unknown error" });
  }
}

export async function setSessionCookie(token: string) {
  if (!token) return;
  await callSessionEndpoint("POST", token);
}

export async function clearSessionCookie() {
  await callSessionEndpoint("DELETE");
}
