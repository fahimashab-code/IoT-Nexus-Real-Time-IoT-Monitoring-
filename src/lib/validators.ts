import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Enter a valid email." }),
});

export const resetPasswordSchema = z
  .object({
    code: z.string().min(4, { message: "Enter the verification code." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z.string().min(6, { message: "Confirm your password." }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const mfaSchema = z.object({
  code: z
    .string()
    .min(6, { message: "Enter the 6-digit code." })
    .max(6, { message: "Enter the 6-digit code." }),
});

export const deviceSchema = z.object({
  name: z.string().min(2, { message: "Device name is required." }),
  location: z.string().min(2, { message: "Location is required." }),
  status: z.enum(["online", "warning", "offline"]),
  firmware: z.string().min(2, { message: "Firmware version is required." }),
  battery: z.coerce.number().min(0).max(100),
});

export const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Enter a valid email." }),
  role: z.enum(["Admin", "Operator", "Viewer"]),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type MfaValues = z.infer<typeof mfaSchema>;
export type DeviceFormValues = z.infer<typeof deviceSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
