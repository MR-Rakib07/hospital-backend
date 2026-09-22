import { z } from 'zod';

export const registerUserSchema = z.object({
  body: z.object({
    email: z
      .string({ message: 'Email is required' })
      .trim()
      .email({ message: 'Please provide a valid email address' }),

    password: z
      .string({ message: 'Password is required' })
      .min(6, { message: 'Password must be at least 6 characters long' }),

    role: z
      .enum(['PATIENT', 'DOCTOR', 'ADMIN', 'STAFF'])
      .default('PATIENT'),

    fullName: z
      .string({ message: 'Full name is required' })
      .trim()
      .min(2, { message: 'Full name must be at least 2 characters long' }),

    phone: z
      .string({ message: 'Phone number is required' })
      .trim()
      .min(10, { message: 'Please provide a valid phone number' }),
  }),
});

export const loginUserSchema = z.object({
  body: z.object({
    email: z.string().trim().email({ message: 'Please provide a valid email address' }),
    password: z.string().min(1, { message: 'Password is required' }),
  }),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>['body'];
export type LoginUserInput = z.infer<typeof loginUserSchema>['body'];