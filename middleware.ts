import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, createRemoteJWKSet } from "jose";
import { routes } from "@/config/routes";
import { SESSION_COOKIE } from "@/lib/auth-constants";

const region = process.env.NEXT_PUBLIC_AWS_REGION;
const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
const issuer =
  region && userPoolId ? `https://cognito-idp.${region}.amazonaws.com/${userPoolId}` : null;
const jwks = issuer ? createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`)) : null;

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    const loginUrl = new URL(routes.auth.login, request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (!jwks || !issuer || !clientId) {
    const loginUrl = new URL(routes.auth.login, request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    await jwtVerify(token, jwks, {
      issuer,
      audience: clientId,
    });
  } catch {
    const loginUrl = new URL(`${routes.auth.login}?reason=expired`, request.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
