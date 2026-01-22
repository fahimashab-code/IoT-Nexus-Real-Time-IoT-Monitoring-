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
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validators";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: ForgotPasswordValues) => {
    toast({
      title: "Reset link sent",
      description: `We emailed reset instructions to ${values.email}.`,
    });
    router.push(routes.auth.resetPassword);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter your email and we will send a reset code.
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
            <Button type="submit" className="w-full">
              Send reset link
            </Button>
          </form>
        </Form>
        <p className="text-center text-sm text-muted-foreground">
          Remembered your password?{" "}
          <Link href={routes.auth.login} className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
