"use client";

import { Amplify } from "aws-amplify";

let configured = false;

export function configureAmplify() {
  if (configured) return;

  const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
  const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
  const region = process.env.NEXT_PUBLIC_AWS_REGION;

  if (!userPoolId || !userPoolClientId || !region) {
    console.warn("Missing Cognito environment variables.");
    return;
  }

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
        signUpVerificationMethod: "code",
        loginWith: {
          email: true,
        },
      },
    },
  });

  configured = true;
}
