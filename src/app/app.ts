import dotenv from "dotenv";
dotenv.config();

import express from "express";
import type { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import authRoutes from '../routes/auth/auth.routes';
import cookieParser from "cookie-parser";
const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser())

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running smoothly",
  });
});
app.use('/api/auth', authRoutes);

app.use((req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;