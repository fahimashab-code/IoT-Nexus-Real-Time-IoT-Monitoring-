import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

type LogPayload = {
  label?: string;
  scope?: string;
  level?: string;
  payload?: unknown;
  at?: string;
};

export async function POST(request: Request) {
  let body: LogPayload | null = null;
  try {
    body = (await request.json()) as LogPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const timestamp = typeof body?.at === "string" ? body.at : new Date().toISOString();
  const label = typeof body?.label === "string" ? body.label : "unknown";
  const scope = typeof body?.scope === "string" ? body.scope : "unknown";
  const level = typeof body?.level === "string" ? body.level : "info";

  const line = JSON.stringify({
    at: timestamp,
    label,
    scope,
    level,
    payload: body?.payload ?? null,
  });

  const logPath = path.join(process.cwd(), "api-request-log.txt");

  try {
    await fs.appendFile(logPath, `${line}\n`, "utf8");
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error)?.message ?? "Failed to write log" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

