"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { VerificationCodeInput } from "@/components/ui/verification-code-input";
import { toast } from "@/components/ui/use-toast";
import { routes } from "@/config/routes";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { completePasswordReset } from "@/lib/cognito-client";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validators";
import { useEffect, useState } from "react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
      code: "",
      password: "",
      confirmPassword: "",
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [code, setCode] = useState("");
  const [codeTouched, setCodeTouched] = useState(false);
  const isCodeValid = code.trim().length === 6;

  useEffect(() => {
    const email = sessionStorage.getItem("iot_reset_email");
    if (email) {
      form.setValue("email", email);
    }
  }, [form]);

  const onSubmit = async (values: ResetPasswordValues) => {
    const trimmedCode = code.trim();
    form.setValue("code", trimmedCode, { shouldValidate: true, shouldDirty: true });
    if (trimmedCode.length !== 6) {
      setCodeTouched(true);
      toast({
        title: "Invalid code",
        description: "Enter the 6-digit reset code from your email.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await completePasswordReset({
        email: values.email,
        code: trimmedCode,
        password: values.password,
      });
      toast({
        title: "Password updated",
        description: "You can now sign in with your new password.",
      });
      sessionStorage.removeItem("iot_reset_email");
      router.push(routes.auth.login);
    } catch (error) {
      toast({
        title: "Reset failed",
        description: getAuthErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Set a new password</CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter the reset code and choose a secure password.
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Reset code</label>
              <VerificationCodeInput
                placeholder="Enter the 6-digit code"
                value={code}
                onChange={(nextValue) => {
                  setCode(nextValue);
                  setCodeTouched(true);
                  form.setValue("code", nextValue, { shouldValidate: true, shouldDirty: true });
                }}
              />
              {codeTouched && form.formState.errors.code ? (
                <p className="text-sm font-medium text-destructive">
                  {String(form.formState.errors.code.message)}
                </p>
              ) : null}
            </div>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting || !isCodeValid}>
              {isSubmitting ? "Updating..." : "Update password"}
            </Button>
          </form>
        </Form>
        <p className="text-center text-sm text-muted-foreground">
          Need a new code?{" "}
          <Link href={routes.auth.forgotPassword} className="font-medium text-primary hover:underline">
            Request another
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
