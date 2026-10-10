import prisma from "../../lib/prisma"
import { AppError } from "../../errors/AppError"

export type AppointmentStatusType = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"

interface CreateAppointmentInput {
  patientId: string
  doctorId: string
  appointmentDate: string
  problemDetails?: string
}

interface AppointmentWhereFilter {
  doctorId?: string
  appointmentDate?: {
    gte: Date
    lte: Date
  }
}

export const createAppointmentService = async (data: CreateAppointmentInput) => {
  const doctor = await prisma.doctorProfile.findUnique({
    where: { id: data.doctorId },
  })

  if (!doctor) {
    throw new AppError(404, "Doctor not found")
  }

  if (!doctor.isAvailable) {
    throw new AppError(400, "Doctor is currently not accepting appointments")
  }

  const requestedDate = new Date(data.appointmentDate)
  const dayName = requestedDate.toLocaleDateString("en-US", { weekday: "long" })

  if (!doctor.availableDays.includes(dayName)) {
    throw new AppError(
      400,
      `Doctor is not available on ${dayName}. Available days: ${doctor.availableDays.join(", ")}`
    )
  }

  const startOfDay = new Date(requestedDate)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(requestedDate)
  endOfDay.setHours(23, 59, 59, 999)

  const existingAppointment = await prisma.appointment.findFirst({
    where: {
      patientId: data.patientId,
      doctorId: data.doctorId,
      appointmentDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: { not: "CANCELLED" },
    },
  })

  if (existingAppointment) {
    throw new AppError(400, "You already have an appointment with this doctor on this day")
  }

  const totalBookedToday = await prisma.appointment.count({
    where: {
      doctorId: data.doctorId,
      appointmentDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  })

  const nextSerial = totalBookedToday + 1

  return prisma.appointment.create({
    data: {
      patientId: data.patientId,
      doctorId: data.doctorId,
      appointmentDate: startOfDay,
      serialNumber: nextSerial,
      problemDetails: data.problemDetails,
    },
    include: {
      doctor: {
        include: {
          user: {
            select: { fullname: true, email: true, phone: true },
          },
        },
      },
      patient: {
        select: { fullname: true, phone: true, email: true },
      },
    },
  })
}

export const getMyAppointmentsService = async (patientId: string) => {
  return prisma.appointment.findMany({
    where: { patientId },
    include: {
      doctor: {
        include: {
          user: {
            select: { fullname: true, phone: true },
          },
        },
      },
    },
    orderBy: { appointmentDate: "desc" },
  })
}

export const getDoctorAppointmentsService = async (
  userId: string,
  userRole: string,
  date?: string
) => {
  const filter: AppointmentWhereFilter = {}

  if (userRole === "DOCTOR") {
    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId },
    })

    if (!doctor) {
      throw new AppError(404, "Doctor profile not found")
    }

    filter.doctorId = doctor.id
  }

  if (date) {
    const target = new Date(date)
    const startOfDay = new Date(target)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(target)
    endOfDay.setHours(23, 59, 59, 999)

    filter.appointmentDate = {
      gte: startOfDay,
      lte: endOfDay,
    }
  }

  return prisma.appointment.findMany({
    where: filter,
    include: {
      patient: {
        select: { id: true, fullname: true, phone: true, email: true, gender: true },
      },
      doctor: {
        include: {
          user: {
            select: { id: true, fullname: true, email: true },
          },
        },
      },
    },
    orderBy: [{ appointmentDate: "desc" }, { serialNumber: "asc" }],
  })
}

export const updateAppointmentStatusService = async (
  appointmentId: string,
  status: AppointmentStatusType
) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  })

  if (!appointment) {
    throw new AppError(404, "Appointment not found")
  }

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
    include: {
      patient: {
        select: { id: true, fullname: true, phone: true },
      },
      doctor: {
        include: {
          user: {
            select: { id: true, fullname: true },
          },
        },
      },
    },
  })
}

export const cancelAppointmentService = async (
  appointmentId: string,
  userId: string,
  userRole: string
) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  })

  if (!appointment) {
    throw new AppError(404, "Appointment not found")
  }

  if (userRole === "PATIENT" && appointment.patientId !== userId) {
    throw new AppError(403, "You can only cancel your own appointments")
  }

  if (appointment.status === "COMPLETED") {
    throw new AppError(400, "Completed appointments cannot be cancelled")
  }

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED" },
    include: {
      patient: {
        select: { id: true, fullname: true, phone: true },
      },
      doctor: {
        include: {
          user: {
            select: { id: true, fullname: true },
          },
        },
      },
    },
  })
}