import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify, createRemoteJWKSet } from "jose";
import { routes } from "@/config/routes";
import type { User } from "@/types";
import { SESSION_COOKIE } from "@/lib/auth-constants";

const region = process.env.NEXT_PUBLIC_AWS_REGION;
const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
const issuer =
  region && userPoolId ? `https://cognito-idp.${region}.amazonaws.com/${userPoolId}` : null;
const jwks = issuer ? createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`)) : null;

export async function getSession() {
  if (!jwks || !issuer || !clientId) return null;
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer,
      audience: clientId,
    });

    const email = typeof payload.email === "string" ? payload.email : "";
    const name = typeof payload.name === "string" ? payload.name : email || "User";
    const id = typeof payload.sub === "string" ? payload.sub : email;

    const user: User = {
      id,
      name,
      email,
      role: "Operator",
    };

    return { user };
  } catch {
    return null;
  }
}

export async function requireAuth() {
  if (!jwks || !issuer || !clientId) {
    redirect(routes.auth.login);
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    redirect(routes.auth.login);
  }

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer,
      audience: clientId,
    });

    const email = typeof payload.email === "string" ? payload.email : "";
    const name = typeof payload.name === "string" ? payload.name : email || "User";
    const id = typeof payload.sub === "string" ? payload.sub : email;

    const user: User = {
      id,
      name,
      email,
      role: "Operator",
    };

    return { user };
  } catch {
    const loginUrl = `${routes.auth.login}?reason=expired`;
    redirect(loginUrl);
  }
}
