import { z } from "zod";

import { PUBLIC_SIGNUP_ROLE_VALUES, ROLE_VALUES } from "@/lib/constants/roles";

const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(ROLE_VALUES),
});

export const signupSchema = z
  .object({
    role: z.enum(PUBLIC_SIGNUP_ROLE_VALUES),
    firstName: z.string().min(2, "First name is required").max(80),
    lastName: z.string().min(2, "Last name is required").max(80),
    email: z.string().email("Enter a valid email address"),
    password: passwordSchema,
    confirmPassword: passwordSchema,
    studentId: z.string().max(30).optional(),
    department: z.string().max(120).optional(),
    graduationYear: z.coerce.number().int().min(2024).max(2100).optional(),
    clubSlug: z.string().optional(),
    designation: z.string().max(120).optional(),
    phone: z.string().max(30).optional(),
  })
  .superRefine((data, context) => {
    if (data.password !== data.confirmPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }

    if (data.role === "student") {
      if (!data.studentId) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Student ID is required for student accounts",
          path: ["studentId"],
        });
      }

      if (!data.department) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Department is required for student accounts",
          path: ["department"],
        });
      }
    }

    if (data.role === "club_admin") {
      if (!data.clubSlug) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select a club for club admin accounts",
          path: ["clubSlug"],
        });
      }

      if (!data.designation) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Designation is required for club admins",
          path: ["designation"],
        });
      }
    }
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
