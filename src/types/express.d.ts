import { Role } from '@prisma/client';

export interface UserPayload {
  userId: string;
  email: string;
  role: Role;
  doctorProfileId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export {};