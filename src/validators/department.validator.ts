import { z } from "zod";

export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Department name is required"),
    specializations: z.array(z.string().trim().min(2)).min(1, "Provide at least one specialization"),
  }),
});

export const updateDepartmentSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).optional(),
    specializations: z.array(z.string().trim().min(2)).optional(),
  }),
});

export const createDesignationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Designation name is required"),
  }),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>["body"];
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>["body"];
export type CreateDesignationInput = z.infer<typeof createDesignationSchema>["body"];