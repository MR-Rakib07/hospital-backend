import { z } from "zod";

export const createAppointmentSchema = z.object({
  body: z.object({
    doctorId: z.string().min(1, "Doctor ID is required"),
    appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    type: z.enum(["ONLINE", "OFFLINE"]).default("OFFLINE"),
    problemDetails: z.string().optional(),
    patientName: z.string().min(2, "Patient name is required"),
    patientPhone: z.string().min(11, "Valid phone number is required"),
    patientEmail: z.string().email("Valid email address is required"),
    patientAge: z.coerce.number().int().positive().optional(),
    patientGender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  }),
});

export const updateAppointmentStatusSchema = z.object({
  body: z.object({
    status: z.enum(["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  }),
});