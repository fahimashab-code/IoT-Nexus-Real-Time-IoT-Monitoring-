import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import type { User } from "@/types";
import { SESSION_COOKIE } from "@/lib/auth-constants";

const demoUser: User = {
  id: "user-1",
  name: "Avery Park",
  email: "avery@iotnexus.dev",
  role: "Operator",
};

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return { user: demoUser };
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect(routes.auth.login);
  }
  return session;
}
