# Auth Migration Guide (Cognito)

This document describes how to reproduce the **exact** Cognito-based auth system from this project in another repo. It is written so another AI (Codex) can implement the same behavior with no guesswork.

## Scope
This guide covers:
1. All files to create or link
2. Folder structure
3. Middleware and routing
4. Types and Redux state
5. Environment variables
6. Login, signup, verify, forgot, reset, MFA flows
7. Session cookie behavior
8. Logging and security constraints

If you already have equivalents in the target repo, map the file paths and keep behavior identical.

## High-Level Architecture
1. Client auth uses `aws-amplify/auth` and stores the Cognito ID token in a secure, HttpOnly cookie (`iot_session`) through a same-origin API route.
2. Server auth verifies the cookie token using Cognito JWKS and gates all `/app/*` routes via middleware and `requireAuth()` in the App layout.
3. Redux keeps a minimal `User` object for client UI.
4. Session sync happens in `AuthProvider` on app mount.

## Environment Variables
Create these in `.env.local` (or target repo equivalent):
1. `NEXT_PUBLIC_COGNITO_USER_POOL_ID` (example: `us-east-1_XXXXX`)
2. `NEXT_PUBLIC_COGNITO_CLIENT_ID` (example: `xxxxxxxxxxxxxxxxxxxxxxxxxx`)
3. `NEXT_PUBLIC_AWS_REGION` (example: `us-east-1`)

Optional logging toggles (used by `src/lib/logging.ts`):
1. `NEXT_PUBLIC_LOGGING_ENABLED` (default is on; set to `false` to disable)
2. `NEXT_PUBLIC_LOG_CONSOLE` (default is on; set to `false` to disable console logs)
3. `NEXT_PUBLIC_LOG_PERSIST` (default is on in non-production; set to `false` to disable `/api/log` posts)

## Required Dependencies
Install dependencies equivalent to this repo:
1. `aws-amplify`
2. `jose`
3. `react-hook-form`
4. `@hookform/resolvers`
5. `zod`
6. `@reduxjs/toolkit`
7. `react-redux`
8. `qrcode`
9. `@radix-ui/react-avatar`
10. `@radix-ui/react-dropdown-menu`
11. `@radix-ui/react-label`
12. `@radix-ui/react-toast`
13. `lucide-react`
14. `class-variance-authority`
15. `clsx`
16. `tailwind-merge`

If your target repo already has any of these, keep versions compatible with Next 16 and React 19 (or align the versions carefully).

## Folder Structure
Replicate this structure in the target repo:
```text
middleware.ts
src/app/layout.tsx
src/app/(auth)/layout.tsx
src/app/(auth)/login/page.tsx
src/app/(auth)/register/page.tsx
src/app/(auth)/verify/page.tsx
src/app/(auth)/forgot-password/page.tsx
src/app/(auth)/reset-password/page.tsx
src/app/(auth)/mfa/page.tsx
src/app/(app)/layout.tsx
src/app/api/auth/session/route.ts

src/config/routes.ts
src/types/index.ts

src/lib/auth-constants.ts
src/lib/auth.ts
src/lib/amplify-client.ts
src/lib/cognito-client.ts
src/lib/auth-errors.ts
src/lib/session-client.ts
src/lib/validators.ts
src/lib/logging.ts
src/lib/utils.ts

src/store/store.ts
src/store/slices/authSlice.ts
src/store/hooks.ts
src/store/provider.tsx

src/components/providers/AuthProvider.tsx
src/components/layout/UserNav.tsx

src/components/ui/button.tsx
src/components/ui/card.tsx
src/components/ui/form.tsx
src/components/ui/input.tsx
src/components/ui/label.tsx
src/components/ui/toast.tsx
src/components/ui/toaster.tsx
src/components/ui/use-toast.ts
src/components/ui/verification-code-input.tsx
src/components/ui/qr-code.tsx
src/components/ui/avatar.tsx
src/components/ui/dropdown-menu.tsx
```

If your project uses a different layout, map each file to its equivalent path and preserve the logic.

## Route Constants (Must Match)
Create `src/config/routes.ts` with these exact paths:
1. `login: "/login"`
2. `register: "/register"`
3. `verify: "/verify"`
4. `forgotPassword: "/forgot-password"`
5. `resetPassword: "/reset-password"`
6. `mfa: "/mfa"`
7. `app.dashboard: "/app/dashboard"`
8. `app.settings: "/app/settings"`

All redirects and `<Link>` references use these constants. Do not change the strings unless you update every reference consistently.

## Session Cookie Contract
Create `src/lib/auth-constants.ts`:
```ts
export const SESSION_COOKIE = "iot_session";
```

Rules:
1. Cookie value is the Cognito ID token only.
2. Cookie is HttpOnly and SameSite=Lax.
3. Cookie is set via `/api/auth/session` only.

## Server-Side Auth Verification
### `src/lib/auth.ts`
Implement:
1. Read env vars `NEXT_PUBLIC_*`.
2. Build issuer URL:
   - `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`
3. Build JWKS URL:
   - `${issuer}/.well-known/jwks.json`
4. `getSession()`:
   - Read cookie.
   - Verify with `jose.jwtVerify(token, jwks, { issuer, audience: clientId })`.
   - Build `User` from payload:
     - `id = payload.sub || email`
     - `email = payload.email`
     - `name = payload.name || email || "User"`
   - Return `{ user }` or `null`.
5. `requireAuth()`:
   - If missing config or token, redirect to `routes.auth.login`.
   - If verify fails, redirect to `routes.auth.login?reason=expired`.

### `middleware.ts`
Protect `/app/*`:
1. If no cookie, redirect to `/login`.
2. If missing config, redirect to `/login`.
3. Verify token as in `getSession()` and redirect to `/login?reason=expired` on failure.
4. `config.matcher = ["/app/:path*"]`.

## Session API Route
Create `src/app/api/auth/session/route.ts`:
1. `export const runtime = "nodejs";`
2. `POST`:
   - Reject cross-site requests using `sec-fetch-site`, `origin`, and `host`.
   - Parse JSON `{ token }`.
   - Verify with JWKS and `clientId`.
   - Ensure `payload.token_use === "id"`.
   - Set cookie with `maxAge` based on token `exp`.
3. `DELETE`:
   - Same origin checks.
   - Clear cookie with `maxAge: 0`.

Important cookie settings:
1. `httpOnly: true`
2. `sameSite: "lax"`
3. `secure: true` when request is HTTPS or `x-forwarded-proto === "https"`.
4. `path: "/"`

## Amplify Configuration
Create `src/lib/amplify-client.ts`:
1. Configure Amplify once per client runtime.
2. Use:
   - `Auth.Cognito.userPoolId`
   - `Auth.Cognito.userPoolClientId`
   - `signUpVerificationMethod: "code"`
   - `loginWith.email = true`
3. If env vars are missing, warn and do not configure.

## Cognito Client Wrapper
Create `src/lib/cognito-client.ts` with these exported functions:
1. `signUpWithEmail({ name, email, password })`
2. `confirmEmail({ email, code })`
3. `resendEmailCode(email)`
4. `signInWithEmail({ email, password })`
5. `updateUserPassword({ oldPassword, newPassword })`
6. `getMfaPreference()`
7. `startTotpSetup()`
8. `verifyTotpSetup(code)`
9. `updateTotpPreference(enabled)`
10. `confirmMfa(code)`
11. `selectMfaMethod("EMAIL" | "TOTP")`
12. `startPasswordReset(email)`
13. `completePasswordReset({ email, code, password })`
14. `getIdToken()`
15. `getUserFromSession()`
16. `signOutUser()`

Each function:
1. Calls `configureAmplify()` first.
2. Logs with `logClientEvent` from `src/lib/logging.ts`.
3. Rethrows errors for UI handling.

## Error Mapping
**File:** `src/lib/auth-errors.ts`
Map Cognito error names to user-friendly messages:
1. `UserNotFoundException` -> "No account found with that email."
2. `NotAuthorizedException` -> "Incorrect email or password."
3. `UserNotConfirmedException` -> "Please verify your email before signing in."
4. `UsernameExistsException` -> "An account with that email already exists."
5. `CodeMismatchException` -> "The verification code is invalid."
6. `ExpiredCodeException` -> "That code has expired. Request a new one."
7. `LimitExceededException` -> "Too many attempts. Please try again later."
8. Default -> error.message or "Something went wrong. Please try again."

## Validators
**File:** `src/lib/validators.ts`
Implement all schemas:
1. `loginSchema`
2. `registerSchema`
3. `registerWithConfirmSchema`
4. `confirmSignUpSchema`
5. `forgotPasswordSchema`
6. `resetPasswordSchema`
7. `changePasswordSchema`
8. `mfaSchema`
Plus exported type aliases (`LoginValues`, `RegisterValues`, etc.).

## Redux
**Files:**
1. `src/store/slices/authSlice.ts`:
   - `AuthState` with `user: User | null`
   - Reducers: `setUser`, `clearUser`
2. `src/store/store.ts`:
   - Combine reducers, include `auth`
3. `src/store/hooks.ts`:
   - `useAppDispatch`, `useAppSelector`
4. `src/store/provider.tsx`:
   - `ReduxProvider` wraps `<Provider store={store}>`

## User Type
**File:** `src/types/index.ts`
Add:
```ts
export interface User {
  id: string;
  name: string;
  email: string;
}
```

## AuthProvider (Session Sync)
**File:** `src/components/providers/AuthProvider.tsx`
On mount:
1. `configureAmplify()`
2. `getUserFromSession()`:
   - If user exists:
     - `dispatch(setUser(user))`
     - `token = await getIdToken()`
     - `setSessionCookie(token)`
   - Else:
     - `dispatch(clearUser())`
     - `clearSessionCookie()`
3. Catch errors and clear state/cookie.

## Root Layout
**File:** `src/app/layout.tsx`
Wrap the app with:
1. `ReduxProvider`
2. `AuthProvider`
3. Theme provider (if used)
4. `Toaster`

## Auth Layout
**File:** `src/app/(auth)/layout.tsx`
Logic:
1. `const session = await getSession()`
2. If session exists -> `redirect(routes.app.dashboard)`
3. Render centered auth layout for login/register/verify/etc.

## App Layout
**File:** `src/app/(app)/layout.tsx`
Logic:
1. `await requireAuth()` before render.
2. Render authenticated shell (sidebar/topbar).

## Login Flow (Exact Logic)
**File:** `src/app/(auth)/login/page.tsx`
1. Validate with `loginSchema`.
2. `signInWithEmail(values)`.
3. Inspect `result.nextStep.signInStep`:
   - `DONE` -> finalize sign-in
   - `CONFIRM_SIGN_IN_WITH_TOTP_CODE` -> set `sessionStorage.iot_mfa = { mode: "totp" }`, go `/mfa`
   - `CONTINUE_SIGN_IN_WITH_TOTP_SETUP` -> set `iot_mfa = { mode: "totp-setup", setupUri }`, go `/mfa`
   - `CONFIRM_SIGN_IN_WITH_EMAIL_CODE` -> set `iot_mfa = { mode: "email", destination }`, go `/mfa`
   - `CONTINUE_SIGN_IN_WITH_MFA_SELECTION` or `..._SETUP_SELECTION` -> set `iot_mfa = { mode: "select", allowed }`, go `/mfa`
   - `CONFIRM_SIGN_UP` -> set `iot_register_email`, call `resendEmailCode`, go `/verify`
4. If error `UserNotConfirmedException` -> set `iot_register_email`, go `/verify`.
5. `finalizeSignIn`:
   - `idToken = await getIdToken()`
   - `setSessionCookie(idToken)`
   - `user = await getUserFromSession()`
   - `dispatch(setUser(user))`
   - redirect `/app/dashboard`

## Register Flow
**File:** `src/app/(auth)/register/page.tsx`
1. Validate with `registerWithConfirmSchema`.
2. `signUpWithEmail(values)`.
3. Store `sessionStorage.iot_register_email`.
4. If `result.nextStep.signUpStep === "CONFIRM_SIGN_UP"` -> go `/verify`.
5. Else -> go `/login`.
6. If error `UsernameExistsException`:
   - `resendEmailCode`
   - if `InvalidParameterException` -> user already confirmed -> go `/login`.

## Verify Email Flow
**File:** `src/app/(auth)/verify/page.tsx`
1. Load `sessionStorage.iot_register_email` into email.
2. Require 6-digit code.
3. `confirmEmail({ email, code })`.
4. On success -> remove storage and go `/login`.
5. Resend:
   - `resendEmailCode(email)`
   - cooldown 30 seconds.

## Forgot Password Flow
**File:** `src/app/(auth)/forgot-password/page.tsx`
1. Validate with `forgotPasswordSchema`.
2. `startPasswordReset(email)`.
3. If `nextStep.resetPasswordStep === "CONFIRM_RESET_PASSWORD_WITH_CODE"`:
   - save `sessionStorage.iot_reset_email`
   - redirect `/reset-password`.

## Reset Password Flow
**File:** `src/app/(auth)/reset-password/page.tsx`
1. Read `sessionStorage.iot_reset_email` to populate email.
2. Use `VerificationCodeInput` for a 6-digit code.
3. `completePasswordReset({ email, code, password })`.
4. Clear `iot_reset_email`.
5. Redirect `/login`.

## MFA Flow
**File:** `src/app/(auth)/mfa/page.tsx`
1. Read `sessionStorage.iot_mfa` on mount.
2. Mode `select`:
   - Buttons call `selectMfaMethod("EMAIL" | "TOTP")`.
   - Update storage with nextStep handling.
3. Mode `email` or `totp`:
   - Collect 6-digit code.
   - `confirmMfa(code)` then finalize sign-in.
4. Mode `totp-setup`:
   - Render QR from `setupUri`.
   - Submit code with `confirmMfa` and finalize.

## Session Storage Keys (Must Match)
1. `iot_register_email`
2. `iot_reset_email`
3. `iot_mfa`

## Logging
`src/lib/logging.ts`:
1. Redacts sensitive keys automatically.
2. Logs to console when enabled.
3. Persists to `/api/log` when enabled (you can stub this endpoint or disable it).

If the target repo does not have `/api/log`, either:
1. Implement it, or
2. Set `NEXT_PUBLIC_LOG_PERSIST=false`.

## UI Components
The auth pages use these UI components:
1. `Button`, `Card`, `Form`, `Input`, `Label`
2. Toast system: `use-toast`, `toaster`
3. `VerificationCodeInput`
4. `QrCode`
5. `Avatar` and `DropdownMenu` for `UserNav`

If the target repo uses a different design system, replace components but keep the logic and props behavior identical.

## Security Notes
1. Only store ID tokens in `iot_session`.
2. Only set and clear cookies via `/api/auth/session`.
3. Verify tokens both in middleware and server auth functions.
4. Use same-origin enforcement on `/api/auth/session`.

## Verification Checklist
1. Login with valid user -> redirected to `/app/dashboard`.
2. Login with unverified user -> redirected to `/verify`.
3. Forgot password -> gets reset code and can set new password.
4. MFA with TOTP -> correct flow and QR setup works.
5. Cookie is HttpOnly and accessible on server.
6. `/app/*` routes are protected by middleware and `requireAuth()`.
7. `AuthProvider` syncs Redux and server cookie on load.

## Known Couplings
1. `SESSION_COOKIE` name must match everywhere.
2. `routes.*` must match page paths.
3. Session storage keys must match.

If you want a fully copied version of the auth files, mirror the contents from the source repo at the same paths.
