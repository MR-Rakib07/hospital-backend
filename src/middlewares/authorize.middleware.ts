import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      throw new AppError(403, "You do not have permission to perform this action");
    }

    next();
  };
};