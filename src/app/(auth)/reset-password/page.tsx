"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { routes } from "@/config/routes";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validators";

export default function ResetPasswordPage() {
  const router = useRouter();
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = () => {
    toast({
      title: "Password updated",
      description: "You can now sign in with your new password.",
    });
    router.push(routes.auth.login);
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
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reset code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the 6-digit code" {...field} />
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
            <Button type="submit" className="w-full">
              Update password
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
