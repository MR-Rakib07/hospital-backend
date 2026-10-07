import { z } from "zod";

export const createAppointmentSchema = z.object({
  body: z.object({
    doctorId: z.string().min(1, "Doctor ID is required"),
    appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    problemDetails: z.string().optional(),
  }),
});

export const updateAppointmentStatusSchema = z.object({
  body: z.object({
    status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]),
  }),
});