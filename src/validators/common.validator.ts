import { z } from "zod";

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const bdPhoneRegex = /^(?:\+?880|0)1[3-9]\d{8}$/;
export const objectIdRegex = /^[0-9a-fA-F]{24}$/;
export const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;

export const objectIdSchema = z.string().regex(objectIdRegex, "Invalid ObjectId format");