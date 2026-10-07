import { z } from "zod";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const registerUserSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .refine((val) => emailRegex.test(val), {
        message: "Please provide a valid email address",
      }),

    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" }),

    role: z
      .enum(["PATIENT", "DOCTOR", "ADMIN", "STAFF"])
      .default("PATIENT"),

    fullname: z
      .string()
      .trim()
      .min(2, { message: "Full name must be at least 2 characters long" }),

    phone: z
      .string()
      .trim()
      .min(10, { message: "Please provide a valid phone number" }),
  }),
});

export const loginUserSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .refine((val) => emailRegex.test(val), {
        message: "Please provide a valid email address",
      }),

    password: z
      .string()
      .min(1, { message: "Password is required" }),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    fullname: z.string().trim().min(2).optional(),
    phone: z.string().trim().min(10).optional(),
    dateOfBirth: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
      })
      .optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    bloodGroup: z
      .enum([
        "A_POSITIVE",
        "A_NEGATIVE",
        "B_POSITIVE",
        "B_NEGATIVE",
        "AB_POSITIVE",
        "AB_NEGATIVE",
        "O_POSITIVE",
        "O_NEGATIVE",
      ])
      .optional(),
    maritalStatus: z
      .enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"])
      .optional(),
    presentAddress: z.string().trim().optional(),
    permanentAddress: z.string().trim().optional(),
    emergencyContactName: z.string().trim().optional(),
    emergencyRelation: z.string().trim().optional(),
    emergencyPhone: z.string().trim().optional(),
  }),
});

export const createDoctorSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .refine((val) => emailRegex.test(val), {
        message: "Please provide a valid email address",
      }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" }),
    fullname: z
      .string()
      .trim()
      .min(2, { message: "Full name must be at least 2 characters long" }),
    phone: z
      .string()
      .trim()
      .min(10, { message: "Please provide a valid phone number" }),
    department: z
      .string()
      .trim()
      .min(1, { message: "Department is required" }),
    specialization: z
      .string()
      .trim()
      .min(1, { message: "Specialization is required" }),
    designation: z.string().trim().optional(),
    experience: z
      .number()
      .int()
      .nonnegative({ message: "Experience must be a positive number" }),
    fee: z
      .number()
      .positive({ message: "Consultation fee must be greater than 0" }),
    image: z
      .string()
      .refine((val) => {
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      }, { message: "Invalid image URL" })
      .optional(),
    availableDays: z
      .array(z.string())
      .min(1, { message: "At least one available day is required" }),
  }),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>["body"];
export type LoginUserInput = z.infer<typeof loginUserSchema>["body"];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
export type CreateDoctorInput = z.infer<typeof createDoctorSchema>["body"];