import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routes } from "@/config/routes";
import { SESSION_COOKIE } from "@/lib/auth-constants";

export function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    const loginUrl = new URL(routes.auth.login, request.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
