import { z } from "zod";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(?:\+?880|0)1[3-9]\d{8}$/;

export const registerUserSchema = z.object({
  body: z.object({
    email: z
      .string({ message: "Email is required" })
      .trim()
      .regex(emailRegex, "Please provide a valid email address"),

    password: z
      .string({ message: "Password is required" })
      .min(6, "Password must be at least 6 characters long"),

    role: z.enum(["PATIENT", "DOCTOR", "ADMIN", "STAFF"]).default("PATIENT"),

    fullname: z
      .string({ message: "Full name is required" })
      .trim()
      .min(2, "Full name must be at least 2 characters long"),

    phone: z
      .string({ message: "Phone number is required" })
      .trim()
      .regex(phoneRegex, "Please provide a valid phone number"),
  }),
});

export const loginUserSchema = z.object({
  body: z.object({
    email: z
      .string({ message: "Email is required" })
      .trim()
      .regex(emailRegex, "Please provide a valid email address"),

    password: z
      .string({ message: "Password is required" })
      .min(1, "Password is required"),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    fullname: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .optional(),
    phone: z
      .string()
      .trim()
      .regex(phoneRegex, "Invalid phone number")
      .optional(),
    dateOfBirth: z
      .string()
      .trim()
      .refine((val) => !isNaN(Date.parse(val)), "Invalid date format")
      .or(z.literal(""))
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
    emergencyPhone: z
      .string()
      .trim()
      .regex(phoneRegex, "Invalid emergency phone number")
      .or(z.literal(""))
      .optional(),
  }),
});

export const createDoctorSchema = z.object({
  body: z.object({
    email: z
      .string({ message: "Email is required" })
      .trim()
      .regex(emailRegex, "Please provide a valid email address"),

    password: z
      .string({ message: "Password is required" })
      .min(6, "Password must be at least 6 characters long"),

    fullname: z
      .string({ message: "Full name is required" })
      .trim()
      .min(2, "Full name must be at least 2 characters long"),

    phone: z
      .string({ message: "Phone number is required" })
      .trim()
      .regex(phoneRegex, "Please provide a valid phone number"),

    department: z
      .string({ message: "Department is required" })
      .trim()
      .min(1, "Department is required"),

    specialization: z
      .string({ message: "Specialization is required" })
      .trim()
      .min(1, "Specialization is required"),

    designation: z.string().trim().optional(),

    experience: z
      .number({ message: "Experience must be a number" })
      .int("Experience must be an integer")
      .min(0, "Experience must be a positive number")
      .default(0),

    fee: z
      .number({ message: "Consultation fee is required" })
      .min(1, "Consultation fee must be greater than 0"),

    teleconsultationFee: z
      .number({ message: "Teleconsultation fee must be a number" })
      .min(0, "Teleconsultation fee cannot be negative")
      .optional()
      .default(0),
    image: z
      .string()
      .trim()
      .refine((val) => !val || /^https?:\/\/.+/.test(val), {
        message: "Invalid image URL",
      })
      .optional(),

    availableDays: z
      .array(z.string().trim())
      .min(1, "At least one available day is required"),

    visitingHours: z.string().trim().optional(),
    roomNumber: z.string().trim().optional(),
    floorNumber: z.string().trim().optional(),
    isAvailable: z.boolean().optional().default(true),
    isEmployed: z.boolean().optional().default(true),
  }),
});

export const updateDoctorSchema = z.object({
  body: z.object({
    department: z.string().trim().min(1).optional(),
    specialization: z.string().trim().min(1).optional(),
    designation: z.string().trim().optional(),
    experience: z.number().int().min(0).optional(),
    fee: z.number().min(1).optional(),
    teleconsultationFee: z.number().min(0).optional(),
    image: z
      .string()
      .trim()
      .url("Invalid image URL")
      .or(z.literal(""))
      .optional(),
    availableDays: z.array(z.string().trim()).min(1).optional(),
    visitingHours: z.string().trim().optional(),
    roomNumber: z.string().trim().optional(),
    floorNumber: z.string().trim().optional(),
    isAvailable: z.boolean().optional(),
    isEmployed: z.boolean().optional(),
  }),
});

export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string({ message: "Department name is required" }).trim().min(2),
    specializations: z
      .array(z.string().trim().min(2))
      .min(1, { message: "Provide at least one specialization" }),
  }),
})

export const updateDepartmentSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).optional(),
    specializations: z.array(z.string().trim().min(2)).optional(),
  }),
})

export const createDesignationSchema = z.object({
  body: z.object({
    name: z.string({ message: "Designation name is required" }).trim().min(2),
  }),
})

export type RegisterUserInput = z.infer<typeof registerUserSchema>["body"];
export type LoginUserInput = z.infer<typeof loginUserSchema>["body"];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
export type CreateDoctorInput = z.infer<typeof createDoctorSchema>["body"];
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>["body"];
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>["body"]
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>["body"]
export type CreateDesignationInput = z.infer<typeof createDesignationSchema>["body"]
