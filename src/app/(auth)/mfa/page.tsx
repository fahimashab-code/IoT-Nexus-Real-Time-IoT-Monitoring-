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
import { mfaSchema, type MfaValues } from "@/lib/validators";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";

export default function MfaPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const form = useForm<MfaValues>({
    resolver: zodResolver(mfaSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = () => {
    document.cookie = `${SESSION_COOKIE}=demo; path=/`;
    dispatch(
      setUser({
        id: "user-1",
        name: "Avery Park",
        email: "avery@iotnexus.dev",
        role: "Operator",
      }),
    );
    toast({
      title: "MFA verified",
      description: "You are now signed in.",
    });
    router.push(routes.app.dashboard);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Multi-factor verification</CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code from your authenticator app.
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
                  <FormLabel>Verification code</FormLabel>
                  <FormControl>
                    <Input placeholder="123456" inputMode="numeric" maxLength={6} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Verify and continue
            </Button>
          </form>
        </Form>
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
