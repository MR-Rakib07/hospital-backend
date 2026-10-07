import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import type { CreateDoctorInput } from "../../validators/user.validatores";

export const createDoctorService = async (data: CreateDoctorInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AppError(409, "A user or doctor with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newDoctor = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      fullname: data.fullname,
      phone: data.phone,
      role: "DOCTOR",
      doctorProfile: {
        create: {
          department: data.department,
          specialization: data.specialization,
          designation: data.designation,
          experience: data.experience,
          fee: data.fee,
          image: data.image,
          availableDays: data.availableDays,
        },
      },
    },
    include: {
      doctorProfile: true,
    },
  });

  const { password: _password, ...safeDoctor } = newDoctor;
  return safeDoctor;
};

export const getAllDoctorsService = async (department?: string) => {
  const filter: Record<string, unknown> = {
    role: "DOCTOR",
  };

  if (department) {
    filter.doctorProfile = {
      department: department,
    };
  }

  const doctors = await prisma.user.findMany({
    where: filter,
    select: {
      id: true,
      fullname: true,
      email: true,
      phone: true,
      doctorProfile: true,
    },
  });

  return doctors;
};

export const getDoctorByIdService = async (id: string) => {
  const doctor = await prisma.user.findFirst({
    where: {
      id,
      role: "DOCTOR",
    },
    select: {
      id: true,
      fullname: true,
      email: true,
      phone: true,
      doctorProfile: true,
    },
  });

  if (!doctor) {
    throw new AppError(404, "Doctor not found");
  }

  return doctor;
};