import { z } from "zod";
import { emailRegex, bdPhoneRegex } from "./common.validator";

export const createStaffSchema = z.object({
  body: z.object({
    email: z.string().trim().regex(emailRegex, "Please provide a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    fullname: z.string().trim().min(2, "Full name must be at least 2 characters long"),
    phone: z.string().trim().regex(bdPhoneRegex, "Please provide a valid phone number"),
    counterNumber: z.string().trim().optional(),
    department: z.string().trim().optional(),
  }),
});

export const updateStaffSchema = z.object({
  body: z.object({
    fullname: z.string().trim().min(2).optional(),
    phone: z.string().trim().regex(bdPhoneRegex).optional(),
    counterNumber: z.string().trim().optional(),
    department: z.string().trim().optional(),
  }),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>["body"];
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>["body"];