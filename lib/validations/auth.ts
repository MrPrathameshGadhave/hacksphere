import { z } from "zod";

const nameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must be less than 50 characters");

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address")
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(100, "Password must be less than 100 characters")
  .refine((value) => /[A-Za-z]/.test(value), {
    message: "Password must include at least one letter",
  })
  .refine((value) => /[0-9]/.test(value), {
    message: "Password must include at least one number",
  });

const collegeSchema = z
  .string()
  .trim()
  .min(2, "College name is required")
  .max(100, "College name must be less than 100 characters");

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  college: collegeSchema,
});

export const participantSignupSchema = signupSchema.extend({
  verificationToken: z
    .string()
    .trim()
    .min(1, "Email verification is required"),
});

export const signupEmailRequestSchema = z.object({
  email: emailSchema,
});

export const signupEmailCodeVerifySchema = z.object({
  email: emailSchema,
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter a valid 6-digit verification code"),
});

export const loginSchema = z.object({
  email: emailSchema,

  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, "Reset token is required"),
  password: passwordSchema,
  confirmPassword: z
    .string()
    .min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const judgeSignupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  college: collegeSchema,
  accessCode: z.string().trim().min(1, "Judge access code is required"),
});

export const adminSignupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  accessCode: z.string().trim().min(1, "Admin access code is required"),
});

export type AdminSignupInput = z.infer<typeof adminSignupSchema>;
export type JudgeSignupInput = z.infer<typeof judgeSignupSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ParticipantSignupInput = z.infer<typeof participantSignupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type SignupEmailRequestInput = z.infer<typeof signupEmailRequestSchema>;
export type SignupEmailCodeVerifyInput = z.infer<
  typeof signupEmailCodeVerifySchema
>;
