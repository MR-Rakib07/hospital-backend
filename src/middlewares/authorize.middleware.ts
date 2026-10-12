import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";
import type { Role } from "@prisma/client";

export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user || !user.role) {
      return next(
        new AppError(401, "You are not authenticated. Please log in first")
      );
    }

    if (!allowedRoles.includes(user.role)) {
      return next(
        new AppError(403, "You do not have permission to perform this action")
      );
    }

    next();
  };
};