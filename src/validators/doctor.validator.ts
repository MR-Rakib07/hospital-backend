import { z } from "zod";
import { emailRegex, bdPhoneRegex } from "./common.validator";

export const createDoctorSchema = z.object({
  body: z.object({
    email: z.string().trim().regex(emailRegex, "Please provide a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    fullname: z.string().trim().min(2, "Full name must be at least 2 characters long"),
    phone: z.string().trim().regex(bdPhoneRegex, "Please provide a valid phone number"),
    department: z.string().trim().min(1, "Department is required"),
    designation: z.string().trim().optional(),
    experience: z.number().int().min(0).default(0),
    fee: z.number().min(1, "Consultation fee must be greater than 0"),
    teleconsultationFee: z.number().min(0).optional().default(0),
    image: z.string().trim().refine((val) => !val || /^https?:\/\/.+/.test(val), "Invalid image URL").optional(),
    availableDays: z.array(z.string().trim()).min(1, "At least one available day is required"),
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
    designation: z.string().trim().optional(),
    experience: z.number().int().min(0).optional(),
    fee: z.number().min(1).optional(),
    teleconsultationFee: z.number().min(0).optional(),
    image: z.string().trim().url("Invalid image URL").or(z.literal("")).optional(),
    availableDays: z.array(z.string().trim()).min(1).optional(),
    visitingHours: z.string().trim().optional(),
    roomNumber: z.string().trim().optional(),
    floorNumber: z.string().trim().optional(),
    isAvailable: z.boolean().optional(),
    isEmployed: z.boolean().optional(),
  }),
});

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>["body"];
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>["body"];