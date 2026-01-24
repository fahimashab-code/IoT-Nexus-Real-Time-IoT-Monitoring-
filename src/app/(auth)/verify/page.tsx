"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { VerificationCodeInput } from "@/components/ui/verification-code-input";
import { toast } from "@/components/ui/use-toast";
import { routes } from "@/config/routes";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { confirmEmail, resendEmailCode } from "@/lib/cognito-client";

const RESEND_COOLDOWN_SECONDS = 30;

export default function VerifyPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeTouched, setCodeTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("iot_register_email");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const isCodeValid = code.trim().length === 6;
  const isEmailValid = email.trim().length > 0;

  const handleVerify = async () => {
    if (!isEmailValid) {
      toast({
        title: "Missing email",
        description: "Enter the email you used to register.",
      });
      return;
    }

    if (!isCodeValid) {
      setCodeTouched(true);
      toast({
        title: "Invalid code",
        description: "Enter the 6-digit verification code from your email.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await confirmEmail({ email: email.trim(), code: code.trim() });
      sessionStorage.removeItem("iot_register_email");
      toast({
        title: "Email verified",
        description: "Your account is ready. Sign in to continue.",
      });
      router.push(routes.auth.login);
    } catch (error) {
      toast({
        title: "Verification failed",
        description: getAuthErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!isEmailValid) {
      toast({
        title: "Missing email",
        description: "Enter the email you used to register.",
      });
      return;
    }

    if (cooldown > 0) return;

    setIsResending(true);
    try {
      await resendEmailCode(email.trim());
      toast({
        title: "Code resent",
        description: `We sent a new code to ${email.trim()}.`,
      });
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      toast({
        title: "Resend failed",
        description: getAuthErrorMessage(error),
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Verify your email</CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit verification code we sent to your inbox.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Verification code</label>
          <VerificationCodeInput
            placeholder="Enter the 6-digit code"
            autoFocus
            value={code}
            onChange={(nextValue) => {
              setCode(nextValue);
              setCodeTouched(true);
            }}
          />
          {codeTouched && !isCodeValid ? (
            <p className="text-sm font-medium text-destructive">
              Enter the 6-digit verification code.
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          className="w-full"
          onClick={handleVerify}
          disabled={!isEmailValid || !isCodeValid || isSubmitting}
        >
          {isSubmitting ? "Verifying..." : "Verify email"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleResend}
          disabled={!isEmailValid || isResending || cooldown > 0}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : isResending ? "Sending..." : "Resend code"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already verified?{" "}
          <Link href={routes.auth.login} className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
