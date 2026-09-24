import dotenv from "dotenv";
dotenv.config();

import express from "express";
import type { Application, Request, Response, NextFunction } from "express";
import cors, { type CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "../routes/auth/auth.routes";

const app: Application = express();

const corsOptions: CorsOptions = {
  origin: (
    _origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running smoothly",
  });
});

app.use("/api/auth", authRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

interface AppError extends Error {
  status?: number;
  statusCode?: number;
}

app.use(
  (
    err: AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    const statusCode = err.status ?? err.statusCode ?? 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
);

export default app;