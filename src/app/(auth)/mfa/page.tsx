"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VerificationCodeInput } from "@/components/ui/verification-code-input";
import { QrCode } from "@/components/ui/qr-code";
import { toast } from "@/components/ui/use-toast";
import { routes } from "@/config/routes";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import {
  confirmMfa,
  getIdToken,
  getUserFromSession,
  selectMfaMethod,
} from "@/lib/cognito-client";
import { setSessionCookie } from "@/lib/session-client";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";

type MfaMode = "totp" | "totp-setup" | "email" | "select";

export default function MfaPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [setupUri, setSetupUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [code, setCode] = useState("");
  const [codeTouched, setCodeTouched] = useState(false);
  const isCodeValid = code.trim().length === 6;
  const [mode, setMode] = useState<MfaMode>("totp");
  const [allowedMethods, setAllowedMethods] = useState<string[]>([]);
  const [deliveryHint, setDeliveryHint] = useState<string | null>(null);

  useEffect(() => {
    const pending = sessionStorage.getItem("iot_mfa");
    if (!pending) return;
    try {
      const data = JSON.parse(pending) as {
        mode?: MfaMode;
        setupUri?: string;
        allowed?: string[];
        destination?: string;
      };
      if (data.mode) setMode(data.mode);
      if (data.setupUri) {
        setSetupUri(data.setupUri);
      }
      if (Array.isArray(data.allowed)) {
        setAllowedMethods(data.allowed);
      }
      if (data.destination) {
        setDeliveryHint(data.destination);
      }
    } catch {
      setSetupUri(null);
    }
  }, []);

  const finalizeSignIn = async () => {
    const idToken = await getIdToken();
    if (idToken) {
      setSessionCookie(idToken);
    }
    const user = await getUserFromSession();
    if (user) {
      dispatch(setUser(user));
    }
    sessionStorage.removeItem("iot_mfa");
    toast({
      title: "MFA verified",
      description: "You are now signed in.",
    });
    router.push(routes.app.dashboard);
  };

  const handleNextStep = async (result: { nextStep?: { signInStep?: string; totpSetupDetails?: { getSetupUri: (appName: string, accountName?: string) => URL }; codeDeliveryDetails?: { destination?: string } } }) => {
    const nextStep = result.nextStep?.signInStep;
    if (nextStep === "DONE") {
      await finalizeSignIn();
      return;
    }

    if (nextStep === "CONFIRM_SIGN_IN_WITH_TOTP_CODE") {
      setMode("totp");
      sessionStorage.setItem("iot_mfa", JSON.stringify({ mode: "totp" }));
      return;
    }

    if (nextStep === "CONTINUE_SIGN_IN_WITH_TOTP_SETUP") {
      const uri = result.nextStep?.totpSetupDetails?.getSetupUri("IoT Nexus").toString() ?? "";
      setMode("totp-setup");
      setSetupUri(uri);
      sessionStorage.setItem("iot_mfa", JSON.stringify({ mode: "totp-setup", setupUri: uri }));
      return;
    }

    if (nextStep === "CONFIRM_SIGN_IN_WITH_EMAIL_CODE") {
      const destination = result.nextStep?.codeDeliveryDetails?.destination ?? "";
      setMode("email");
      setDeliveryHint(destination);
      sessionStorage.setItem("iot_mfa", JSON.stringify({ mode: "email", destination }));
      return;
    }
  };

  const onSubmit = async () => {
    if (code.trim().length !== 6) {
      setCodeTouched(true);
      toast({
        title: "Invalid code",
        description:
          mode === "email"
            ? "Enter the 6-digit code from your email."
            : "Enter the 6-digit code from your authenticator app.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await confirmMfa(code.trim());
      await finalizeSignIn();
    } catch (error) {
      toast({
        title: "Verification failed",
        description: getAuthErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectMethod = async (method: "EMAIL" | "TOTP") => {
    setIsSubmitting(true);
    try {
      const result = await selectMfaMethod(method);
      await handleNextStep(result);
    } catch (error) {
      toast({
        title: "MFA selection failed",
        description: getAuthErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Multi-factor verification</CardTitle>
        <p className="text-sm text-muted-foreground">
          {mode === "select"
            ? "Choose how you want to verify your sign-in."
            : mode === "email"
              ? `Enter the code sent to ${deliveryHint || "your email"}.`
              : setupUri
                ? "Scan the setup link in your authenticator app, then enter the 6-digit code."
                : "Enter the 6-digit code from your authenticator app."}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {setupUri && mode === "totp-setup" ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-4 text-sm">
              <p className="font-medium">Authenticator setup link</p>
              <p className="mt-1 break-all text-muted-foreground">{setupUri}</p>
            </div>
            <div className="flex justify-center">
              <QrCode value={setupUri} size={180} />
            </div>
          </div>
        ) : null}
        {mode === "select" ? (
          <div className="space-y-3">
            <Button
              type="button"
              className="w-full"
              onClick={() => handleSelectMethod("EMAIL")}
              disabled={isSubmitting || (allowedMethods.length > 0 && !allowedMethods.includes("EMAIL"))}
            >
              Use email code
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleSelectMethod("TOTP")}
              disabled={isSubmitting || (allowedMethods.length > 0 && !allowedMethods.includes("TOTP"))}
            >
              Use authenticator app
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Lost your authenticator? Contact support to reset MFA.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Verification code</label>
              <VerificationCodeInput
                placeholder="123456"
                value={code}
                onChange={(nextValue) => {
                  setCode(nextValue);
                  setCodeTouched(true);
                }}
              />
              {codeTouched && code.trim().length !== 6 ? (
                <p className="text-sm font-medium text-destructive">Enter the 6-digit code.</p>
              ) : null}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || !isCodeValid}>
              {isSubmitting ? "Verifying..." : "Verify and continue"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Lost your authenticator? Contact support to reset MFA.
            </p>
          </form>
        )}
        <p className="text-center text-sm text-muted-foreground">
          Prefer password login?{" "}
          <Link href={routes.auth.login} className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
