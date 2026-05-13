"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { configureAmplify } from "@/lib/amplify-client";
import { getIdToken, getUserFromSession } from "@/lib/cognito-client";
import { clearSessionCookie, setSessionCookie } from "@/lib/session-client";
import { useAppDispatch } from "@/store/hooks";
import { clearUser, setUser } from "@/store/slices/authSlice";

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    configureAmplify();
    const syncSession = async () => {
      try {
        const user = await getUserFromSession();
        if (user) {
          dispatch(setUser(user));
          const token = await getIdToken();
          if (token) {
            await setSessionCookie(token);
          }
          return;
        }
        dispatch(clearUser());
        await clearSessionCookie();
      } catch {
        dispatch(clearUser());
        await clearSessionCookie();
      }
    };
    void syncSession();
  }, [dispatch]);

  return children;
}
