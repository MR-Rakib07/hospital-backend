import { z } from "zod";

export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Department name is required"),
    roleType: z.enum(["DOCTOR", "STAFF"], {
      message: "Role type must be either DOCTOR or STAFF",
    }),
  }),
});

export const updateDepartmentSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).optional(),
    roleType: z.enum(["DOCTOR", "STAFF"]).optional(),
  }),
});

export const createDesignationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Designation name is required"),
    roleType: z.enum(["DOCTOR", "STAFF"], {
      message: "Role type must be either DOCTOR or STAFF",
    }),
  }),
});

export const updateDesignationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).optional(),
    roleType: z.enum(["DOCTOR", "STAFF"]).optional(),
  }),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>["body"];
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>["body"];
export type CreateDesignationInput = z.infer<typeof createDesignationSchema>["body"];
export type UpdateDesignationInput = z.infer<typeof updateDesignationSchema>["body"];