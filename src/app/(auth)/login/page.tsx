"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { routes } from "@/config/routes";
import { loginSchema, type LoginValues } from "@/lib/validators";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { getIdToken, getUserFromSession, resendEmailCode, signInWithEmail } from "@/lib/cognito-client";
import { setSessionCookie } from "@/lib/session-client";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (searchParams.get("reason") === "expired") {
      toast({
        title: "Session expired",
        description: "Please sign in again to continue.",
      });
    }
  }, [searchParams]);

  const finalizeSignIn = async (email: string) => {
    const idToken = await getIdToken();
    if (idToken) {
      await setSessionCookie(idToken);
    }
    const user = await getUserFromSession();
    if (user) {
      dispatch(setUser(user));
    }
    toast({
      title: "Welcome back",
      description: `Signed in as ${email}`,
    });
    router.push(routes.app.dashboard);
  };

  const onSubmit = async (values: LoginValues) => {
    setIsSubmitting(true);
    try {
      const result = await signInWithEmail(values);
      const nextStep = result.nextStep?.signInStep;

      if (nextStep === "DONE") {
        await finalizeSignIn(values.email);
        return;
      }

      if (nextStep === "CONFIRM_SIGN_IN_WITH_TOTP_CODE") {
        sessionStorage.setItem("iot_mfa", JSON.stringify({ mode: "totp" }));
        toast({
          title: "MFA required",
          description: "Enter the verification code from your authenticator app.",
        });
        router.push(routes.auth.mfa);
        return;
      }

      if (nextStep === "CONTINUE_SIGN_IN_WITH_TOTP_SETUP") {
        const setupUri = result.nextStep?.totpSetupDetails
          ?.getSetupUri("IoT Nexus")
          .toString();
        sessionStorage.setItem(
          "iot_mfa",
          JSON.stringify({ mode: "totp-setup", setupUri: setupUri ?? "" }),
        );
        toast({
          title: "Set up MFA",
          description: "Scan the QR setup link, then enter the 6-digit code.",
        });
        router.push(routes.auth.mfa);
        return;
      }

      if (nextStep === "CONFIRM_SIGN_IN_WITH_EMAIL_CODE") {
        const destination = result.nextStep?.codeDeliveryDetails?.destination ?? "";
        sessionStorage.setItem(
          "iot_mfa",
          JSON.stringify({ mode: "email", destination }),
        );
        toast({
          title: "Email code required",
          description: "Enter the verification code sent to your email.",
        });
        router.push(routes.auth.mfa);
        return;
      }

      if (
        nextStep === "CONTINUE_SIGN_IN_WITH_MFA_SELECTION" ||
        nextStep === "CONTINUE_SIGN_IN_WITH_MFA_SETUP_SELECTION"
      ) {
        const allowed = result.nextStep?.allowedMFATypes ?? [];
        sessionStorage.setItem(
          "iot_mfa",
          JSON.stringify({ mode: "select", allowed }),
        );
        toast({
          title: "Choose MFA method",
          description: "Select how you want to receive your verification code.",
        });
        router.push(routes.auth.mfa);
        return;
      }

      if (nextStep === "CONFIRM_SIGN_UP") {
        sessionStorage.setItem("iot_register_email", values.email);
        try {
          await resendEmailCode(values.email);
        } catch (error) {
          toast({
            title: "Code resend failed",
            description: getAuthErrorMessage(error),
          });
        }
        toast({
          title: "Verify your email",
          description: "Please confirm your email to finish signing in.",
        });
        router.push(routes.auth.verify);
        return;
      }

      toast({
        title: "Sign in requires more steps",
        description: "Please complete the next step in your sign-in flow.",
      });
    } catch (error) {
      const name = (error as Error & { name?: string })?.name ?? "";
      if (name === "UserNotConfirmedException") {
        sessionStorage.setItem("iot_register_email", values.email);
        toast({
          title: "Verify your email",
          description: "Please confirm your email to finish signing in.",
        });
        router.push(routes.auth.verify);
        return;
      }

      toast({
        title: "Sign in failed",
        description: getAuthErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <p className="text-sm text-muted-foreground">
          Access your IoT fleet with a secure session.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@company.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href={routes.auth.forgotPassword}
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Form>
        <p className="text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link href={routes.auth.register} className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
