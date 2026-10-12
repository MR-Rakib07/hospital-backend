import crypto from "crypto";
import prisma from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import type {
  AppointmentStatus,
  AppointmentType,
  Gender,
  Role,
} from "@prisma/client";

export interface CreateAppointmentInput {
  doctorId: string;
  appointmentDate: string;
  type?: AppointmentType;
  problemDetails?: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientAge?: number;
  patientGender?: Gender;
  patientId?: string;
}

interface AppointmentWhereFilter {
  doctorId?: string;
  status?: AppointmentStatus;
  appointmentDate?: {
    gte: Date;
    lte: Date;
  };
}

export const generateCustomSerial = (
  departmentName?: string | null,
  doctorFullName?: string | null,
  serialNumber?: number | null
): string => {
  const cleanDept = (departmentName || "GEN")
    .replace(/[^a-zA-Z]/g, "")
    .trim()
    .toUpperCase();
  const deptCode = cleanDept.slice(0, 3) || "GEN";

  const cleanName = (doctorFullName || "Doctor")
    .replace(/^(dr|doctor)\.?\s+/i, "")
    .replace(/[^a-zA-Z\s]/g, "")
    .trim();

  const nameParts = cleanName.split(/\s+/).filter(Boolean);

  let docCode = "DOC";
  if (nameParts.length >= 2) {
    docCode = `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
  } else if (nameParts.length === 1 && nameParts[0].length >= 2) {
    docCode = nameParts[0].slice(0, 2).toUpperCase();
  }

  const numCode = String(serialNumber || 0).padStart(3, "0");
  return `${deptCode}-${docCode}-${numCode}`;
};

export const createAppointmentService = async (data: CreateAppointmentInput) => {
  const doctor = await prisma.doctorProfile.findUnique({
    where: { id: data.doctorId },
    include: {
      user: {
        select: { fullname: true },
      },
    },
  });

  if (!doctor || !doctor.isEmployed) {
    throw new AppError(404, "Doctor profile not found or inactive");
  }

  if (!doctor.isAvailable) {
    throw new AppError(400, "Doctor is currently not accepting appointments");
  }

  const requestedDate = new Date(data.appointmentDate);
  const dayName = requestedDate.toLocaleDateString("en-US", { weekday: "long" });

  if (!doctor.availableDays.includes(dayName)) {
    throw new AppError(
      400,
      `Doctor is not available on ${dayName}. Available days: ${doctor.availableDays.join(", ")}`
    );
  }

  const startOfDay = new Date(requestedDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(requestedDate);
  endOfDay.setHours(23, 59, 59, 999);

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
  });

  if (existingAppointment) {
    throw new AppError(
      400,
      "An active appointment already exists for this phone number with this doctor today"
    );
  }

  const lastAppointment = await prisma.appointment.findFirst({
    where: {
      doctorId: data.doctorId,
      appointmentDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: { serialNumber: "desc" },
    select: { serialNumber: true },
  });

  const nextSerial = (lastAppointment?.serialNumber || 0) + 1;

  const formattedSerialCode = generateCustomSerial(
    doctor.department,
    doctor.user?.fullname,
    nextSerial
  );

  const appointmentType: AppointmentType = data.type || "OFFLINE";

  let meetingRoomId: string | null = null;
  let meetingLink: string | null = null;

  if (appointmentType === "ONLINE") {
    meetingRoomId = crypto.randomUUID();
    meetingLink = `/teleconsultation/${meetingRoomId}`;
  }

  let resolvedPatientId: string | undefined = data.patientId || undefined;

  if (!resolvedPatientId) {
    const orConditions: Array<{ phone?: string; email?: string }> = [
      { phone: data.patientPhone },
    ];

    if (data.patientEmail && data.patientEmail.trim() !== "") {
      orConditions.push({ email: data.patientEmail.trim() });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: orConditions,
        isDeleted: false,
      },
    });

    if (existingUser) {
      resolvedPatientId = existingUser.id;
    }
  }

  const createdAppointment = await prisma.appointment.create({
    data: {
      serialNumber: nextSerial,
      serialCode: formattedSerialCode,
      appointmentDate: startOfDay,
      type: appointmentType,
      status: "PENDING",
      problemDetails: data.problemDetails,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      patientEmail: data.patientEmail?.trim() || null,
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
  });

  return {
    ...createdAppointment,
    formattedSerialCode,
  };
};

export const getMyAppointmentsService = async (identifier: string) => {
  const appointments = await prisma.appointment.findMany({
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
  });

  return appointments.map((apt) => ({
    ...apt,
    formattedSerialCode:
      apt.serialCode ||
      generateCustomSerial(
        apt.doctor?.department,
        apt.doctor?.user?.fullname,
        apt.serialNumber
      ),
  }));
};

export const getDoctorAppointmentsService = async (
  userId: string,
  userRole: Role,
  queryOptions?: {
    doctorId?: string;
    date?: string;
    status?: AppointmentStatus;
  }
) => {
  const filter: AppointmentWhereFilter = {};

  if (userRole === "DOCTOR") {
    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new AppError(404, "Doctor profile not found for this account");
    }

    filter.doctorId = doctor.id;
  } else if ((userRole === "ADMIN" || userRole === "STAFF") && queryOptions?.doctorId) {
    filter.doctorId = queryOptions.doctorId;
  }

  if (queryOptions?.status) {
    filter.status = queryOptions.status;
  }

  if (queryOptions?.date) {
    const target = new Date(queryOptions.date);
    const startOfDay = new Date(target);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(target);
    endOfDay.setHours(23, 59, 59, 999);

    filter.appointmentDate = {
      gte: startOfDay,
      lte: endOfDay,
    };
  }

  const appointments = await prisma.appointment.findMany({
    where: filter,
    include: {
      doctor: {
        include: {
          user: {
            select: { id: true, fullname: true, email: true, phone: true },
          },
        },
      },
      prescription: true,
      patient: {
        select: { id: true, fullname: true, phone: true, email: true },
      },
    },
    orderBy: [{ appointmentDate: "desc" }, { serialNumber: "asc" }],
  });

  return appointments.map((apt) => ({
    ...apt,
    formattedSerialCode:
      apt.serialCode ||
      generateCustomSerial(
        apt.doctor?.department,
        apt.doctor?.user?.fullname,
        apt.serialNumber
      ),
  }));
};

export const getAppointmentByIdService = async (appointmentId: string) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      doctor: {
        include: {
          user: {
            select: { fullname: true, email: true, phone: true },
          },
        },
      },
      patient: {
        select: { fullname: true, email: true, phone: true },
      },
      prescription: true,
    },
  });

  if (!appointment) {
    throw new AppError(404, "Appointment not found");
  }

  return {
    ...appointment,
    formattedSerialCode:
      appointment.serialCode ||
      generateCustomSerial(
        appointment.doctor?.department,
        appointment.doctor?.user?.fullname,
        appointment.serialNumber
      ),
  };
};

export const updateAppointmentStatusService = async (
  appointmentId: string,
  status: AppointmentStatus
) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      doctor: {
        include: {
          user: { select: { fullname: true } },
        },
      },
    },
  });

  if (!appointment) {
    throw new AppError(404, "Appointment not found");
  }

  const updatedAppointment = await prisma.appointment.update({
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
  });

  return {
    ...updatedAppointment,
    formattedSerialCode:
      updatedAppointment.serialCode ||
      generateCustomSerial(
        updatedAppointment.doctor?.department,
        updatedAppointment.doctor?.user?.fullname,
        updatedAppointment.serialNumber
      ),
  };
};

export const cancelAppointmentService = async (
  appointmentId: string,
  userId: string,
  userRole: Role
) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    throw new AppError(404, "Appointment not found");
  }

  if (
    userRole === "PATIENT" &&
    appointment.patientId &&
    appointment.patientId !== userId
  ) {
    throw new AppError(403, "You can only cancel your own appointments");
  }

  if (appointment.status === "COMPLETED") {
    throw new AppError(400, "Completed appointments cannot be cancelled");
  }

  if (appointment.status === "CANCELLED") {
    throw new AppError(400, "Appointment is already cancelled");
  }

  const cancelledAppointment = await prisma.appointment.update({
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
  });

  return {
    ...cancelledAppointment,
    formattedSerialCode:
      cancelledAppointment.serialCode ||
      generateCustomSerial(
        cancelledAppointment.doctor?.department,
        cancelledAppointment.doctor?.user?.fullname,
        cancelledAppointment.serialNumber
      ),
  };
};