import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../errors/AppError";
import {
  createAppointmentService,
  getMyAppointmentsService,
  getDoctorAppointmentsService,
  updateAppointmentStatusService,
  cancelAppointmentService,
} from "../../services/appointment/appointment.services";

export const createAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, "Unauthorized");
    }

    const patientId = req.user.userId;
    const { doctorId, appointmentDate, problemDetails } = req.body;

    const appointment = await createAppointmentService({
      patientId,
      doctorId,
      appointmentDate,
      problemDetails,
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
    if (!req.user) {
      throw new AppError(401, "Unauthorized");
    }

    const patientId = req.user.userId;
    const appointments = await getMyAppointmentsService(patientId);

    res.status(200).json({
      success: true,
      message: "Appointments retrieved successfully",
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
    if (!req.user) {
      throw new AppError(401, "Unauthorized");
    }

    const doctorUserId = req.user.userId;
    const dateQuery = typeof req.query.date === "string" ? req.query.date : undefined;

    const appointments = await getDoctorAppointmentsService(doctorUserId, dateQuery);

    res.status(200).json({
      success: true,
      message: "Doctor schedule retrieved successfully",
      data: appointments,
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
    const { status } = req.body;

    const updated = await updateAppointmentStatusService(id, status);

    res.status(200).json({
      success: true,
      message: "Appointment status updated successfully",
      data: updated,
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
    if (!req.user) {
      throw new AppError(401, "Unauthorized");
    }

    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const cancelled = await cancelAppointmentService(id, userId, userRole);

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: cancelled,
    });
  } catch (error) {
    next(error);
  }
};