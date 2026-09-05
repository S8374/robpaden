// src/Modules/Auth/AuthDTO.ts
import { z } from "zod";

export const createUserSchema = {
  body: z.object({
    email: z.string().email("Invalid email address"),
    firstName: z.string().min(2, "First name is too short"),
    lastName: z.string().min(2, "Last name is too short"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    // You can make optional fields available too based on your Prisma schema
    username: z.string().optional(),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
};

export type CreateUserDTO = z.infer<typeof createUserSchema.body>;
export type LoginDTO = z.infer<typeof loginSchema.body>;

export const forgotPasswordSchema = {
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
};

export const verifyOtpSchema = {
  body: z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be 6 characters"),
  }),
};

export const resetPasswordSchema = {
  body: z.object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
};

export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema.body>;
export type VerifyOtpDTO = z.infer<typeof verifyOtpSchema.body>;
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema.body>;
