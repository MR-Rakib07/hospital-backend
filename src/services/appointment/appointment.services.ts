import prisma from "../../lib/prisma"
import { AppError } from "../../errors/AppError"
import crypto from "crypto"

export type AppointmentStatusType = "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
export type AppointmentTypeValue = "ONLINE" | "OFFLINE"
export type GenderType = "MALE" | "FEMALE" | "OTHER"

interface CreateAppointmentInput {
  doctorId: string
  appointmentDate: string
  type?: AppointmentTypeValue
  problemDetails?: string
  patientName: string
  patientPhone: string
  patientEmail: string
  patientAge?: number
  patientGender?: GenderType
  patientId?: string
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
      doctorId: data.doctorId,
      patientPhone: data.patientPhone,
      appointmentDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: { not: "CANCELLED" },
    },
  })

  if (existingAppointment) {
    throw new AppError(400, "An appointment already exists for this phone number with this doctor on this day")
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
  const appointmentType = data.type || "OFFLINE"

  let meetingRoomId: string | null = null
  let meetingLink: string | null = null

  if (appointmentType === "ONLINE") {
    meetingRoomId = crypto.randomUUID()
    meetingLink = `/teleconsultation/${meetingRoomId}`
  }

  let resolvedPatientId: string | undefined = data.patientId || undefined

  if (!resolvedPatientId) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ phone: data.patientPhone }, { email: data.patientEmail }],
      },
    })
    if (existingUser) {
      resolvedPatientId = existingUser.id
    }
  }

  return prisma.appointment.create({
    data: {
      serialNumber: nextSerial,
      appointmentDate: startOfDay,
      type: appointmentType,
      status: "PENDING",
      problemDetails: data.problemDetails,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      patientEmail: data.patientEmail,
      patientAge: data.patientAge,
      patientGender: data.patientGender,
      meetingRoomId,
      meetingLink,
      paymentStatus: "UNPAID",
      paidAmount: 0,
      doctorId: data.doctorId,
      ...(resolvedPatientId ? { patientId: resolvedPatientId } : {}),
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

export const getMyAppointmentsService = async (identifier: string) => {
  return prisma.appointment.findMany({
    where: {
      OR: [
        { patientId: identifier },
        { patientPhone: identifier },
        { patientEmail: identifier },
      ],
    },
    include: {
      doctor: {
        include: {
          user: {
            select: { fullname: true, phone: true },
          },
        },
      },
      prescription: true,
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
      doctor: {
        include: {
          user: {
            select: { id: true, fullname: true, email: true },
          },
        },
      },
      prescription: true,
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
      doctor: {
        include: {
          user: {
            select: { id: true, fullname: true },
          },
        },
      },
      prescription: true,
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

  if (userRole === "PATIENT" && appointment.patientId && appointment.patientId !== userId) {
    throw new AppError(403, "You can only cancel your own appointments")
  }

  if (appointment.status === "COMPLETED") {
    throw new AppError(400, "Completed appointments cannot be cancelled")
  }

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED" },
    include: {
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