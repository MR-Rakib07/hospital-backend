import type { Request, Response, NextFunction } from "express";
import {
  cancelAppointmentService,
  createAppointmentService,
  getAppointmentByIdService,
  getDoctorAppointmentsService,
  getMyAppointmentsService,
  updateAppointmentStatusService,
  type CreateAppointmentInput,
} from "../../services/appointment/appointment.services";
import { AppError } from "../../errors/AppError";
import type { AppointmentStatus, Role } from "@prisma/client";

export const createAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const inputData = req.body as CreateAppointmentInput;

    const appointment = await createAppointmentService({
      ...inputData,
      patientId: inputData.patientId || req.user?.id || req.user?.userId,
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAppointments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const identifier =
      req.user?.id ||
      req.user?.userId ||
      (typeof req.query.phone === "string" ? req.query.phone.trim() : undefined) ||
      (typeof req.query.email === "string" ? req.query.email.trim() : undefined);

    if (!identifier) {
      throw new AppError(
        400,
        "Please provide patient phone or email, or log in to view appointments"
      );
    }

    const appointments = await getMyAppointmentsService(identifier);

    res.status(200).json({
      success: true,
      message: "My appointments fetched successfully",
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorAppointments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const userRole = req.user?.role as Role | undefined;

    if (!userId || !userRole) {
      throw new AppError(401, "Unauthorized access. Please log in first");
    }

    const { doctorId, date, status } = req.query;

    const appointments = await getDoctorAppointmentsService(userId, userRole, {
      doctorId: typeof doctorId === "string" && doctorId.trim().length > 0 ? doctorId.trim() : undefined,
      date: typeof date === "string" && date.trim().length > 0 ? date.trim() : undefined,
      status: typeof status === "string" && status.trim().length > 0 ? (status.trim() as AppointmentStatus) : undefined,
    });

    res.status(200).json({
      success: true,
      message: "Appointments fetched successfully",
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointmentById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new AppError(400, "Appointment ID is required");
    }

    const appointment = await getAppointmentByIdService(id);

    res.status(200).json({
      success: true,
      message: "Appointment details retrieved successfully",
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentStatus = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: AppointmentStatus };

    if (!id) {
      throw new AppError(400, "Appointment ID is required");
    }

    if (!status) {
      throw new AppError(400, "Appointment status is required");
    }

    const updatedAppointment = await updateAppointmentStatusService(id, status);

    res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}`,
      data: updatedAppointment,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelAppointment = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const userRole = req.user?.role as Role | undefined;

    if (!userId || !userRole) {
      throw new AppError(401, "Unauthorized access. Please log in first");
    }

    const { id } = req.params;

    if (!id) {
      throw new AppError(400, "Appointment ID is required");
    }

    const cancelledAppointment = await cancelAppointmentService(
      id,
      userId,
      userRole
    );

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: cancelledAppointment,
    });
  } catch (error) {
    next(error);
  }
};