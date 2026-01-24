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
    getUserFromSession()
      .then((user) => {
        if (user) {
          dispatch(setUser(user));
          getIdToken().then((token) => {
            if (token) setSessionCookie(token);
          });
        } else {
          dispatch(clearUser());
          clearSessionCookie();
        }
      })
      .catch(() => {
        dispatch(clearUser());
        clearSessionCookie();
      });
  }, [dispatch]);

  return children;
}
