import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string().min(8, { message: "Confirm your password." }),
});

export const registerWithConfirmSchema = registerSchema.refine(
  (values) => values.password === values.confirmPassword,
  {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  },
);

export const confirmSignUpSchema = z.object({
  code: z
    .string()
    .min(6, { message: "Enter the 6-digit verification code." })
    .max(6, { message: "Enter the 6-digit verification code." }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Enter a valid email." }),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().email({ message: "Enter a valid email." }),
    code: z.string().min(4, { message: "Enter the verification code." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string().min(8, { message: "Confirm your password." }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Current password is required." }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .regex(/[A-Z]/, { message: "Add at least one uppercase letter." })
      .regex(/[a-z]/, { message: "Add at least one lowercase letter." })
      .regex(/[0-9]/, { message: "Add at least one number." })
      .regex(/[^A-Za-z0-9]/, { message: "Add at least one symbol." }),
    confirmNewPassword: z.string().min(8, { message: "Confirm your new password." }),
  })
  .refine((values) => values.newPassword === values.confirmNewPassword, {
    message: "Passwords do not match.",
    path: ["confirmNewPassword"],
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    message: "New password must be different.",
    path: ["newPassword"],
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
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerWithConfirmSchema>;
export type ConfirmSignUpValues = z.infer<typeof confirmSignUpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
export type MfaValues = z.infer<typeof mfaSchema>;
export type DeviceFormValues = z.infer<typeof deviceSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
