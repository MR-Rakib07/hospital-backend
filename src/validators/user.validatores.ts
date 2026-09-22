import { z } from 'zod';

export const registerUserSchema = z.object({
  body: z.object({
    email: z
      .email('Please provide a valid email address')
      .trim(),

    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long'),

    role: z
      .enum(['PATIENT', 'DOCTOR', 'ADMIN', 'STAFF'])
      .default('PATIENT'),

    fullName: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters long'),

    phone: z
      .string()
      .trim()
      .min(10, 'Please provide a valid phone number'),
  }),
});

export const loginUserSchema = z.object({
  body: z.object({
    email: z
      .email('Please provide a valid email address')
      .trim(),
    password: z
      .string()
      .min(1, 'Password is required'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2).optional(),
    phone: z.string().trim().min(10).optional(),
    dateOfBirth: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
      })
      .optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
    bloodGroup: z
      .enum([
        'A_POSITIVE',
        'A_NEGATIVE',
        'B_POSITIVE',
        'B_NEGATIVE',
        'AB_POSITIVE',
        'AB_NEGATIVE',
        'O_POSITIVE',
        'O_NEGATIVE',
      ])
      .optional(),
    maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']).optional(),
    presentAddress: z.string().trim().optional(),
    permanentAddress: z.string().trim().optional(),
    emergencyContactName: z.string().trim().optional(),
    emergencyRelation: z.string().trim().optional(),
    emergencyPhone: z.string().trim().optional(),
  }),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>['body'];
export type LoginUserInput = z.infer<typeof loginUserSchema>['body'];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];