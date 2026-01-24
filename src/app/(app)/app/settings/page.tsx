"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { VerificationCodeInput } from "@/components/ui/verification-code-input";
import { QrCode } from "@/components/ui/qr-code";
import { toast } from "@/components/ui/use-toast";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import {
  getMfaPreference,
  startTotpSetup,
  updateTotpPreference,
  updateUserPassword,
  verifyTotpSetup,
} from "@/lib/cognito-client";
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordValues,
  type ProfileValues,
} from "@/lib/validators";
import { useAppSelector } from "@/store/hooks";
import { useEffect, useMemo, useState } from "react";

export default function SettingsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      role: user?.role ?? "Operator",
    },
  });
  const passwordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState<boolean | null>(null);
  const [mfaLoading, setMfaLoading] = useState(false);
  const [setupUri, setSetupUri] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaCodeTouched, setMfaCodeTouched] = useState(false);
  const isMfaCodeValid = mfaCode.trim().length === 6;
  const [showMfaDialog, setShowMfaDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        role: user.role,
      });
    }
  }, [user, form]);

  const onSubmit = (values: ProfileValues) => {
    toast({
      title: "Profile updated",
      description: `Role set to ${values.role}`,
    });
  };

  const handlePasswordUpdate = async (values: ChangePasswordValues) => {
    setIsUpdatingPassword(true);
    try {
      await updateUserPassword({
        oldPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast({
        title: "Password updated",
        description: "Use your new password next time you sign in.",
      });
      passwordForm.reset();
    } catch (error) {
      toast({
        title: "Password update failed",
        description: getAuthErrorMessage(error),
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const loadMfaStatus = async () => {
    setMfaLoading(true);
    try {
      const pref = await getMfaPreference();
      const enabled = pref.enabled?.includes("TOTP") ?? false;
      setMfaEnabled(enabled);
    } catch (error) {
      setMfaEnabled(false);
      toast({
        title: "MFA status unavailable",
        description: getAuthErrorMessage(error),
      });
    } finally {
      setMfaLoading(false);
    }
  };

  useEffect(() => {
    loadMfaStatus();
  }, []);

  const handleStartMfaSetup = async () => {
    setMfaLoading(true);
    try {
      const details = await startTotpSetup();
      const uri = details.getSetupUri("IoT Nexus", user?.email);
      setSetupUri(uri.toString());
      setShowMfaDialog(true);
      toast({
        title: "Scan the setup link",
        description: "Open your authenticator app and enter the 6-digit code.",
      });
    } catch (error) {
      toast({
        title: "MFA setup failed",
        description: getAuthErrorMessage(error),
      });
    } finally {
      setMfaLoading(false);
    }
  };

  const handleVerifyMfa = async () => {
    if (!isMfaCodeValid) {
      setMfaCodeTouched(true);
      toast({
        title: "Invalid code",
        description: "Enter the 6-digit code from your authenticator app.",
      });
      return;
    }

    setMfaLoading(true);
    try {
      await verifyTotpSetup(mfaCode.trim());
      await updateTotpPreference(true);
      setSetupUri(null);
      setMfaCode("");
      setMfaEnabled(true);
      setShowMfaDialog(false);
      toast({
        title: "MFA enabled",
        description: "Authenticator app is now required at sign-in.",
      });
    } catch (error) {
      toast({
        title: "MFA verification failed",
        description: getAuthErrorMessage(error),
      });
    } finally {
      setMfaLoading(false);
    }
  };

  const handleDisableMfa = async () => {
    setMfaLoading(true);
    try {
      await updateTotpPreference(false);
      setMfaEnabled(false);
      setShowDisableDialog(false);
      toast({
        title: "MFA disabled",
        description: "You can now sign in without a TOTP code.",
      });
    } catch (error) {
      toast({
        title: "MFA update failed",
        description: getAuthErrorMessage(error),
      });
    } finally {
      setMfaLoading(false);
    }
  };

  const passwordHelp = useMemo(
    () =>
      "Use 8+ characters with uppercase, lowercase, number, and symbol.",
    [],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile and notification preferences.
        </p>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Operator">Operator</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Save changes</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPasswordForm((prev) => !prev)}
            >
              {showPasswordForm ? "Hide change password" : "Change password"}
            </Button>
            {showPasswordForm ? (
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)}
                  className="space-y-4"
                >
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">{passwordHelp}</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmNewPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm new password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={!passwordForm.formState.isValid || isUpdatingPassword}
                  >
                    {isUpdatingPassword ? "Updating..." : "Update password"}
                  </Button>
                </form>
              </Form>
            ) : null}
          </div>
        </CardContent>
      </Card>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Multi-factor authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div>
              <p className="font-medium">
                Status:{" "}
                {mfaEnabled === null ? "Loading..." : mfaEnabled ? "Enabled" : "Disabled"}
              </p>
              <p className="text-muted-foreground">
                Use an authenticator app to protect your account.
              </p>
            </div>
            {mfaEnabled ? (
              <Button
                variant="outline"
                onClick={() => setShowDisableDialog(true)}
                disabled={mfaLoading}
              >
                {mfaLoading ? "Updating..." : "Disable MFA"}
              </Button>
            ) : (
              <Button onClick={handleStartMfaSetup} disabled={mfaLoading}>
                {mfaLoading ? "Preparing..." : "Enable MFA"}
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            Lost your authenticator? Contact support to reset MFA.
          </div>
        </CardContent>
      </Card>
      <Dialog open={showMfaDialog} onOpenChange={setShowMfaDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set up authenticator</DialogTitle>
            <DialogDescription>
              Scan the QR code in your authenticator app, then enter the 6-digit code.
            </DialogDescription>
          </DialogHeader>
          {setupUri ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-3 text-xs">
                <p className="font-medium">Setup link</p>
                <p className="mt-1 break-all text-muted-foreground">{setupUri}</p>
              </div>
              <div className="flex justify-center">
                <QrCode value={setupUri} size={180} />
              </div>
            </div>
          ) : null}
          <div className="space-y-2">
            <label className="text-sm font-medium">Verification code</label>
            <VerificationCodeInput
              placeholder="123456"
              value={mfaCode}
              onChange={(nextValue) => {
                setMfaCode(nextValue);
                setMfaCodeTouched(true);
              }}
            />
            {mfaCodeTouched && !isMfaCodeValid ? (
              <p className="text-sm font-medium text-destructive">
                Enter the 6-digit code.
              </p>
            ) : null}
          </div>
          <Button onClick={handleVerifyMfa} disabled={mfaLoading || !isMfaCodeValid}>
            {mfaLoading ? "Verifying..." : "Verify and enable"}
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Disable MFA?</DialogTitle>
            <DialogDescription>
              This removes the extra verification step on sign-in.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDisableDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDisableMfa} disabled={mfaLoading}>
              {mfaLoading ? "Updating..." : "Disable"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
