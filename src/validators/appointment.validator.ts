import { z } from "zod";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const createAppointmentSchema = z.object({
  body: z.object({
    doctorId: z
      .string()
      .min(1, "Please select a doctor"),

    appointmentDate: z
      .string()
      .refine((val) => DATE_REGEX.test(val), {
        message: "Date must be in YYYY-MM-DD format",
      }),

    type: z.enum(["ONLINE", "OFFLINE"]).default("OFFLINE"),

    problemDetails: z.string().optional().nullable(),

    patientName: z
      .string()
      .min(2, "Patient name must be at least 2 characters"),

    patientPhone: z
      .string()
      .min(10, "Valid phone number is required"),

    patientEmail: z
      .string()
      .email()
      .optional()
      .nullable()
      .or(z.literal("")),

    patientAge: z.coerce.number().int().positive().optional().nullable(),

    patientGender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().nullable(),

    patientId: z.string().optional().nullable(),
  }),
});

export const updateAppointmentStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      "PENDING",
      "CONFIRMED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ]),
  }),
});

export type CreateAppointmentInput = z.infer<
  typeof createAppointmentSchema
>["body"];

export type UpdateAppointmentStatusInput = z.infer<
  typeof updateAppointmentStatusSchema
>["body"];