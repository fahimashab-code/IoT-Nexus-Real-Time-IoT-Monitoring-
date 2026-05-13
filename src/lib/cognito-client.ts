"use client";

import type { User } from "@/types";
import { configureAmplify } from "@/lib/amplify-client";
import { logClientEvent } from "@/lib/logging";
import {
  confirmResetPassword,
  confirmSignIn,
  confirmSignUp,
  fetchMFAPreference,
  fetchAuthSession,
  resendSignUpCode,
  resetPassword,
  setUpTOTP,
  signIn,
  signOut,
  signUp,
  updateMFAPreference,
  updatePassword,
  verifyTOTPSetup,
} from "aws-amplify/auth";

export async function signUpWithEmail({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  configureAmplify();
  await logClientEvent({
    label: "cognito.signUp.request",
    scope: "cognito",
    payload: { email, name },
  });
  try {
    const result = await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          name,
        },
      },
    });
    await logClientEvent({
      label: "cognito.signUp.response",
      scope: "cognito",
      payload: result,
    });
    return result;
  } catch (error) {
    await logClientEvent({
      label: "cognito.signUp.error",
      scope: "cognito",
      level: "error",
      payload: { message: (error as Error)?.message ?? "Unknown error", error },
    });
    throw error;
  }
}

export async function confirmEmail({ email, code }: { email: string; code: string }) {
  configureAmplify();
  await logClientEvent({
    label: "cognito.confirmSignUp.request",
    scope: "cognito",
    payload: { email },
  });
  try {
    const result = await confirmSignUp({ username: email, confirmationCode: code });
    await logClientEvent({
      label: "cognito.confirmSignUp.response",
      scope: "cognito",
      payload: result,
    });
    return result;
  } catch (error) {
    await logClientEvent({
      label: "cognito.confirmSignUp.error",
      scope: "cognito",
      level: "error",
      payload: { message: (error as Error)?.message ?? "Unknown error", error },
    });
    throw error;
  }
}

export async function resendEmailCode(email: string) {
  configureAmplify();
  await logClientEvent({
    label: "cognito.resendSignUpCode.request",
    scope: "cognito",
    payload: { email },
  });
  try {
    const result = await resendSignUpCode({ username: email });
    await logClientEvent({
      label: "cognito.resendSignUpCode.response",
      scope: "cognito",
      payload: result,
    });
    return result;
  } catch (error) {
    await logClientEvent({
      label: "cognito.resendSignUpCode.error",
      scope: "cognito",
      level: "error",
      payload: { message: (error as Error)?.message ?? "Unknown error", error },
    });
    throw error;
  }
}

export async function signInWithEmail({ email, password }: { email: string; password: string }) {
  configureAmplify();
  await logClientEvent({
    label: "cognito.signIn.request",
    scope: "cognito",
    payload: { email },
  });
  try {
    const result = await signIn({ username: email, password });
    await logClientEvent({
      label: "cognito.signIn.response",
      scope: "cognito",
      payload: result,
    });
    return result;
  } catch (error) {
    await logClientEvent({
      label: "cognito.signIn.error",
      scope: "cognito",
      level: "error",
      payload: { message: (error as Error)?.message ?? "Unknown error", error },
    });
    throw error;
  }
}

export async function updateUserPassword({
  oldPassword,
  newPassword,
}: {
  oldPassword: string;
  newPassword: string;
}) {
  configureAmplify();
  await logClientEvent({
    label: "cognito.updatePassword.request",
    scope: "cognito",
  });
  try {
    await updatePassword({ oldPassword, newPassword });
    await logClientEvent({
      label: "cognito.updatePassword.response",
      scope: "cognito",
      payload: { ok: true },
    });
  } catch (error) {
    await logClientEvent({
      label: "cognito.updatePassword.error",
      scope: "cognito",
      level: "error",
      payload: { message: (error as Error)?.message ?? "Unknown error", error },
    });
    throw error;
  }
}

export async function getMfaPreference() {
  configureAmplify();
  await logClientEvent({
    label: "cognito.fetchMFAPreference.request",
    scope: "cognito",
  });
  try {
    const result = await fetchMFAPreference();
    await logClientEvent({
      label: "cognito.fetchMFAPreference.response",
      scope: "cognito",
      payload: result,
    });
    return result;
  } catch (error) {
    await logClientEvent({
      label: "cognito.fetchMFAPreference.error",
      scope: "cognito",
      level: "error",
      payload: { message: (error as Error)?.message ?? "Unknown error", error },
    });
    throw error;
  }
}

export async function startTotpSetup() {
  configureAmplify();
  await logClientEvent({
    label: "cognito.setUpTOTP.request",
    scope: "cognito",
  });
  try {
    const result = await setUpTOTP();
    await logClientEvent({
      label: "cognito.setUpTOTP.response",
      scope: "cognito",
      payload: { hasSecret: Boolean(result?.sharedSecret) },
    });
    return result;
  } catch (error) {
    await logClientEvent({
      label: "cognito.setUpTOTP.error",
      scope: "cognito",
      level: "error",
      payload: { message: (error as Error)?.message ?? "Unknown error", error },
    });
    throw error;
  }
}

export async function verifyTotpSetup(code: string) {
  configureAmplify();
  await logClientEvent({
    label: "cognito.verifyTOTPSetup.request",
    scope: "cognito",
  });
  try {
    await verifyTOTPSetup({ code });
    await logClientEvent({
      label: "cognito.verifyTOTPSetup.response",
      scope: "cognito",
      payload: { ok: true },
    });
  } catch (error) {
    await logClientEvent({
      label: "cognito.verifyTOTPSetup.error",
      scope: "cognito",
      level: "error",
      payload: { message: (error as Error)?.message ?? "Unknown error", error },
    });
    throw error;
  }
}

export async function updateTotpPreference(enabled: boolean) {
  configureAmplify();
  await logClientEvent({
    label: "cognito.updateMFAPreference.request",
    scope: "cognito",
    payload: { totp: enabled ? "PREFERRED" : "DISABLED" },
  });
  try {
    await updateMFAPreference({
      totp: enabled ? "PREFERRED" : "DISABLED",
    });
    await logClientEvent({
      label: "cognito.updateMFAPreference.response",
      scope: "cognito",
      payload: { ok: true },
    });
  } catch (error) {
    await logClientEvent({
      label: "cognito.updateMFAPreference.error",
      scope: "cognito",
      level: "error",
      payload: { message: (error as Error)?.message ?? "Unknown error", error },
    });
    throw error;
  }
}

export async function confirmMfa(code: string) {
  configureAmplify();
  await logClientEvent({
    label: "cognito.confirmSignIn.request",
    scope: "cognito",
  });
  try {
    const result = await confirmSignIn({ challengeResponse: code });
    await logClientEvent({
      label: "cognito.confirmSignIn.response",
      scope: "cognito",
      payload: result,
    });
    return result;
  } catch (error) {
    await logClientEvent({
      label: "cognito.confirmSignIn.error",
      scope: "cognito",
      level: "error",
      payload: { message: (error as Error)?.message ?? "Unknown error", error },
    });
    throw error;
  }
}

export async function selectMfaMethod(method: "EMAIL" | "TOTP") {
  configureAmplify();
  await logClientEvent({
    label: "cognito.selectMfa.request",
    scope: "cognito",
    payload: { method },
  });
  try {
    const result = await confirmSignIn({ challengeResponse: method });
    await logClientEvent({
      label: "cognito.selectMfa.response",
      scope: "cognito",
      payload: result,
    });
    return result;
  } catch (error) {
    await logClientEvent({
      label: "cognito.selectMfa.error",
      scope: "cognito",
      level: "error",
      payload: { message: (error as Error)?.message ?? "Unknown error", error },
    });
    throw error;
  }
}

export async function startPasswordReset(email: string) {
  configureAmplify();
  await logClientEvent({
    label: "cognito.resetPassword.request",
    scope: "cognito",
    payload: { email },
  });
  try {
    const result = await resetPassword({ username: email });
    await logClientEvent({
      label: "cognito.resetPassword.response",
      scope: "cognito",
      payload: result,
    });
    return result;
  } catch (error) {
    await logClientEvent({
      label: "cognito.resetPassword.error",
      scope: "cognito",
      level: "error",
      payload: { message: (error as Error)?.message ?? "Unknown error", error },
    });
    throw error;
  }
}

export async function completePasswordReset({
  email,
  code,
  password,
}: {
  email: string;
  code: string;
  password: string;
}) {
  configureAmplify();
  await logClientEvent({
    label: "cognito.confirmResetPassword.request",
    scope: "cognito",
    payload: { email },
  });
  try {
    const result = await confirmResetPassword({
      username: email,
      confirmationCode: code,
      newPassword: password,
    });
    await logClientEvent({
      label: "cognito.confirmResetPassword.response",
      scope: "cognito",
      payload: result,
    });
    return result;
  } catch (error) {
    await logClientEvent({
      label: "cognito.confirmResetPassword.error",
      scope: "cognito",
      level: "error",
      payload: { message: (error as Error)?.message ?? "Unknown error", error },
    });
    throw error;
  }
}

export async function getIdToken() {
  configureAmplify();
  await logClientEvent({
    label: "cognito.fetchAuthSession.request",
    scope: "cognito",
  });
  try {
    const session = await fetchAuthSession();
    await logClientEvent({
      label: "cognito.fetchAuthSession.response",
      scope: "cognito",
      payload: session,
    });
    return session.tokens?.idToken?.toString() ?? null;
  } catch (error) {
    await logClientEvent({
      label: "cognito.fetchAuthSession.error",
      scope: "cognito",
      level: "error",
      payload: { message: (error as Error)?.message ?? "Unknown error", error },
    });
    throw error;
  }
}

export async function getUserFromSession(): Promise<User | null> {
  configureAmplify();
  const session = await fetchAuthSession();
  const payload = session.tokens?.idToken?.payload;
  if (!payload) return null;

  const email = typeof payload.email === "string" ? payload.email : "";
  const name = typeof payload.name === "string" ? payload.name : email || "User";
  const id = typeof payload.sub === "string" ? payload.sub : email;

  return {
    id,
    name,
    email,
  };
}

export async function signOutUser() {
  configureAmplify();
  await logClientEvent({
    label: "cognito.signOut.request",
    scope: "cognito",
  });
  try {
    const result = await signOut();
    await logClientEvent({
      label: "cognito.signOut.response",
      scope: "cognito",
      payload: result,
    });
    return result;
  } catch (error) {
    await logClientEvent({
      label: "cognito.signOut.error",
      scope: "cognito",
      level: "error",
      payload: { message: (error as Error)?.message ?? "Unknown error", error },
    });
    throw error;
  }
}
