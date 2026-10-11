import type { Request, Response, NextFunction } from "express"
import {
  cancelAppointmentService,
  createAppointmentService,
  getDoctorAppointmentsService,
  getMyAppointmentsService,
  updateAppointmentStatusService,
  type AppointmentStatusType,
  type AppointmentTypeValue,
  type GenderType,
} from "../../services/appointment/appointment.services"
import { AppError } from "../../errors/AppError"

export const createAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      doctorId,
      appointmentDate,
      type,
      problemDetails,
      patientName,
      patientPhone,
      patientEmail,
      patientAge,
      patientGender,
    } = req.body as {
      doctorId: string
      appointmentDate: string
      type?: AppointmentTypeValue
      problemDetails?: string
      patientName: string
      patientPhone: string
      patientEmail: string
      patientAge?: number
      patientGender?: GenderType
    }

    const appointment = await createAppointmentService({
      doctorId,
      appointmentDate,
      type,
      problemDetails,
      patientName,
      patientPhone,
      patientEmail,
      patientAge,
      patientGender,
      patientId: req.user?.userId,
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
    const identifier =
      req.user?.userId ||
      (typeof req.query.phone === "string" ? req.query.phone : undefined) ||
      (typeof req.query.email === "string" ? req.query.email : undefined)

    if (!identifier) {
      throw new AppError(400, "Please provide patient phone or email, or login to view appointments")
    }

    const appointments = await getMyAppointmentsService(identifier)

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
    const id = String(req.params.id)
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

    const id = String(req.params.id)

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