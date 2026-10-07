import prisma from "../../lib/prisma";
import { AppError } from "../../errors/AppError";

interface CreateAppointmentInput {
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  problemDetails?: string;
}

type AppointmentStatusType = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export const createAppointmentService = async (data: CreateAppointmentInput) => {
  const doctor = await prisma.doctorProfile.findUnique({
    where: { id: data.doctorId },
  });

  if (!doctor) {
    throw new AppError(404, "Doctor not found");
  }

  if (!doctor.isAvailable) {
    throw new AppError(400, "Doctor is currently not accepting appointments");
  }

  const requestedDate = new Date(data.appointmentDate);
  const dayName = requestedDate.toLocaleDateString("en-US", { weekday: "long" });

  if (!doctor.availableDays.includes(dayName)) {
    throw new AppError(400, `Doctor is not available on ${dayName}. Available days: ${doctor.availableDays.join(", ")}`);
  }

  const startOfDay = new Date(requestedDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(requestedDate.setHours(23, 59, 59, 999));

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
  });

  if (existingAppointment) {
    throw new AppError(400, "You already have an appointment with this doctor on this day");
  }

  const totalBookedToday = await prisma.appointment.count({
    where: {
      doctorId: data.doctorId,
      appointmentDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const nextSerial = totalBookedToday + 1;

  const appointment = await prisma.appointment.create({
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
    },
  });

  return appointment;
};

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
  });
};

export const getDoctorAppointmentsService = async (doctorUserId: string, date?: string) => {
  const doctor = await prisma.doctorProfile.findUnique({
    where: { userId: doctorUserId },
  });

  if (!doctor) {
    throw new AppError(404, "Doctor profile not found");
  }

  const filter: Record<string, unknown> = { doctorId: doctor.id };

  if (date) {
    const target = new Date(date);
    filter.appointmentDate = {
      gte: new Date(target.setHours(0, 0, 0, 0)),
      lte: new Date(target.setHours(23, 59, 59, 999)),
    };
  }

  return prisma.appointment.findMany({
    where: filter,
    include: {
      patient: {
        select: { fullname: true, phone: true, gender: true, bloodGroup: true },
      },
    },
    orderBy: [{ appointmentDate: "asc" }, { serialNumber: "asc" }],
  });
};

export const updateAppointmentStatusService = async (
  appointmentId: string,
  status: AppointmentStatusType
) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    throw new AppError(404, "Appointment not found");
  }

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
  });
};

export const cancelAppointmentService = async (
  appointmentId: string,
  userId: string,
  userRole: string
) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    throw new AppError(404, "Appointment not found");
  }

  if (userRole === "PATIENT" && appointment.patientId !== userId) {
    throw new AppError(403, "You can only cancel your own appointments");
  }

  if (appointment.status === "COMPLETED") {
    throw new AppError(400, "Completed appointments cannot be cancelled");
  }

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED" },
  });
};