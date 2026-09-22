import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError(401, "You are not authenticated"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.JWT_ACCESS_SECRET || "access_secret_key";
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    next(new AppError(403, "Invalid or expired access token"));
  }
};