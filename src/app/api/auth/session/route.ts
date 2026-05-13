import { NextResponse } from "next/server";
import { jwtVerify, createRemoteJWKSet } from "jose";
import { SESSION_COOKIE } from "@/lib/auth-constants";

export const runtime = "nodejs";

const region = process.env.NEXT_PUBLIC_AWS_REGION;
const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
const issuer =
  region && userPoolId ? `https://cognito-idp.${region}.amazonaws.com/${userPoolId}` : null;
const jwks = issuer ? createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`)) : null;

function isSameOrigin(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "same-site") {
    return false;
  }

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) return false;
    } catch {
      return false;
    }
  }

  return true;
}

function isSecureRequest(request: Request) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto === "https";
  }
  return new URL(request.url).protocol === "https:";
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: "Invalid origin" }, { status: 403 });
  }

  if (!jwks || !issuer || !clientId) {
    return NextResponse.json({ ok: false, error: "Missing Cognito config" }, { status: 500 });
  }

  let token = "";
  try {
    const body = (await request.json()) as { token?: string };
    token = typeof body?.token === "string" ? body.token : "";
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!token) {
    return NextResponse.json({ ok: false, error: "Missing token" }, { status: 400 });
  }

  try {
    const { payload } = await jwtVerify(token, jwks, { issuer, audience: clientId });
    if (payload.token_use && payload.token_use !== "id") {
      return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 401 });
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    const exp = typeof payload.exp === "number" ? payload.exp : nowSeconds + 60 * 60;
    const maxAge = Math.max(exp - nowSeconds, 0);
    if (maxAge <= 0) {
      return NextResponse.json({ ok: false, error: "Token expired" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: SESSION_COOKIE,
      value: token,
      httpOnly: true,
      secure: isSecureRequest(request),
      sameSite: "lax",
      path: "/",
      maxAge,
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error)?.message ?? "Token verification failed" },
      { status: 401 },
    );
  }
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: "Invalid origin" }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: isSecureRequest(request),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
