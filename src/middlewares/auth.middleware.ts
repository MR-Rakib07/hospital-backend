import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError";

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(new AppError(401, "You are not authenticated"));
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    next(new AppError(401, "Access token missing"));
    return;
  }

  try {
    const secret = process.env.JWT_ACCESS_SECRET || "access_secret_key";
    const decoded = jwt.verify(token, secret) as Record<string, unknown>;

    req.user = {
      userId: (decoded.userId || decoded.id) as string,
      role: (decoded.role as string) || "user",
    };

    next();
  } catch {
    next(new AppError(401, "Invalid or expired access token"));
  }
};