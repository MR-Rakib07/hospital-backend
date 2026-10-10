import type { Request, Response, NextFunction } from "express"
import {
  cancelAppointmentService,
  createAppointmentService,
  getDoctorAppointmentsService,
  getMyAppointmentsService,
  updateAppointmentStatusService,
  type AppointmentStatusType,
} from "../../services/appointment/appointment.services"
import { AppError } from "../../errors/AppError"

export const createAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      throw new AppError(401, "Unauthorized access")
    }

    const { doctorId, appointmentDate, problemDetails } = req.body as {
      doctorId: string
      appointmentDate: string
      problemDetails?: string
    }

    const appointment = await createAppointmentService({
      patientId: req.user.userId,
      doctorId,
      appointmentDate,
      problemDetails,
    })

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: appointment,
    })
  } catch (error) {
    next(error)
  }
}

export const getMyAppointments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      throw new AppError(401, "Unauthorized access")
    }

    const appointments = await getMyAppointmentsService(req.user.userId)

    res.status(200).json({
      success: true,
      message: "My appointments fetched successfully",
      data: appointments,
    })
  } catch (error) {
    next(error)
  }
}

export const getDoctorAppointments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.userId || !req.user?.role) {
      throw new AppError(401, "Unauthorized access")
    }

    const dateQuery = typeof req.query.date === "string" ? req.query.date : undefined

    const appointments = await getDoctorAppointmentsService(
      req.user.userId,
      req.user.role,
      dateQuery
    )

    res.status(200).json({
      success: true,
      message: "Appointments fetched successfully",
      data: appointments,
    })
  } catch (error) {
    next(error)
  }
}

export const updateAppointmentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const  id  = String(req.params.id)
    const { status } = req.body as { status: AppointmentStatusType }

    const updatedAppointment = await updateAppointmentStatusService(id, status)

    res.status(200).json({
      success: true,
      message: "Appointment status updated successfully",
      data: updatedAppointment,
    })
  } catch (error) {
    next(error)
  }
}

export const cancelAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.userId || !req.user?.role) {
      throw new AppError(401, "Unauthorized access")
    }

    const  id  = String(req.params.id)

    const cancelledAppointment = await cancelAppointmentService(
      id,
      req.user.userId,
      req.user.role
    )

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: cancelledAppointment,
    })
  } catch (error) {
    next(error)
  }
}