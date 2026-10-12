import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { AppError } from "../errors/AppError";
import type { Role } from "@prisma/client";

export interface CustomJwtPayload extends JwtPayload {
  id: string;
  email: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        userId: string;
        email: string;
        role: Role;
      };
    }
  }
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError(401, "You are not authenticated. Please log in"));
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return next(new AppError(401, "Access token is missing"));
  }

  try {
    const secret = process.env.JWT_ACCESS_SECRET || "access_secret_key";
    const decoded = jwt.verify(token, secret) as CustomJwtPayload;

    const resolvedId = decoded.id || (decoded as Record<string, unknown>).userId;

    if (!resolvedId) {
      return next(new AppError(401, "Invalid token payload"));
    }

    req.user = {
      id: resolvedId as string,
      userId: resolvedId as string,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError(401, "Access token has expired. Please refresh your token"));
    }
    return next(new AppError(401, "Invalid access token"));
  }
};