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
import { SESSION_COOKIE } from "@/lib/auth-constants";
import { loginSchema, type LoginValues } from "@/lib/validators";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginValues) => {
    document.cookie = `${SESSION_COOKIE}=demo; path=/`;
    dispatch(
      setUser({
        id: "user-1",
        name: "Avery Park",
        email: values.email,
        role: "Operator",
      }),
    );
    toast({
      title: "Welcome back",
      description: `Signed in as ${values.email}`,
    });
    router.push(routes.app.dashboard);
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
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
        </Form>
        <Button variant="outline" className="w-full" asChild>
          <Link href={routes.auth.mfa}>Use MFA instead</Link>
        </Button>
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
