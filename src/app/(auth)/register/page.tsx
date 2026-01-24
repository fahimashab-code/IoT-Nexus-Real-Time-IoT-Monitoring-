"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { routes } from "@/config/routes";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { resendEmailCode, signUpWithEmail } from "@/lib/cognito-client";
import {
  registerWithConfirmSchema,
  type RegisterValues,
} from "@/lib/validators";

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerWithConfirmSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterValues) => {
    setIsSubmitting(true);
    try {
      const result = await signUpWithEmail(values);
      sessionStorage.setItem("iot_register_email", values.email);

      if (result.nextStep?.signUpStep === "CONFIRM_SIGN_UP") {
        toast({
          title: "Check your inbox",
          description: "Enter the verification code sent to your email.",
        });
        router.push(routes.auth.verify);
      } else {
        toast({
          title: "Account created",
          description: "You can now sign in.",
        });
        router.push(routes.auth.login);
      }
    } catch (error) {
      const name = (error as Error & { name?: string })?.name ?? "";
      if (name === "UsernameExistsException") {
        sessionStorage.setItem("iot_register_email", values.email);
        try {
          await resendEmailCode(values.email);
          toast({
            title: "Verify your email",
            description: "We sent a new verification code to your inbox.",
          });
          router.push(routes.auth.verify);
        } catch (resendError) {
          const resendName = (resendError as Error & { name?: string })?.name ?? "";
          if (resendName === "InvalidParameterException") {
            toast({
              title: "Account already verified",
              description: "Please sign in instead.",
            });
            router.push(routes.auth.login);
            return;
          }
          toast({
            title: "Resend failed",
            description: getAuthErrorMessage(resendError),
          });
        }
        return;
      }

      toast({
        title: "Sign up failed",
        description: getAuthErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <p className="text-sm text-muted-foreground">
          Get instant access to the IoT Nexus control room.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Avery Park" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                  <FormLabel>Password</FormLabel>
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
            <Button
              type="submit"
              className="w-full"
              disabled={!form.formState.isValid || isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </Form>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href={routes.auth.login} className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
