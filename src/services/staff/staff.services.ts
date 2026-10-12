import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import type {
  CreateStaffInput,
  UpdateStaffInput,
} from "../../validators/staff.validator";

export const createStaffService = async (data: CreateStaffInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AppError(409, "A user or staff with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newStaff = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      fullname: data.fullname,
      phone: data.phone,
      role: "STAFF",
      isActive: true,
      isDeleted: false,
      staffProfile: {
        create: {
          counterNumber: data.counterNumber,
          department: data.department,
        },
      },
    },
    include: {
      staffProfile: true,
    },
  });

  const { password: _password, ...safeStaff } = newStaff;
  return safeStaff;
};

export const getAllStaffsService = async (department?: string) => {
  const filter: Record<string, unknown> = {
    role: "STAFF",
    isActive: true,
    isDeleted: false,
    ...(department
      ? {
          staffProfile: {
            is: { department },
          },
        }
      : {}),
  };

  const staffs = await prisma.user.findMany({
    where: filter,
    select: {
      id: true,
      fullname: true,
      email: true,
      phone: true,
      isActive: true,
      staffProfile: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return staffs;
};

export const getStaffByIdService = async (id: string) => {
  const staff = await prisma.user.findFirst({
    where: {
      id,
      role: "STAFF",
      isActive: true,
      isDeleted: false,
    },
    select: {
      id: true,
      fullname: true,
      email: true,
      phone: true,
      isActive: true,
      staffProfile: true,
      createdAt: true,
    },
  });

  if (!staff || !staff.staffProfile) {
    throw new AppError(404, "Staff profile not found or inactive");
  }

  return staff;
};

export const updateStaffService = async (
  id: string,
  data: UpdateStaffInput
) => {
  const staff = await prisma.user.findFirst({
    where: {
      id,
      role: "STAFF",
      isDeleted: false,
    },
    include: {
      staffProfile: true,
    },
  });

  if (!staff || !staff.staffProfile) {
    throw new AppError(404, "Staff profile not found");
  }

  const updatedStaff = await prisma.$transaction(async (tx) => {
    if (data.counterNumber !== undefined || data.department !== undefined) {
      await tx.staffProfile.update({
        where: { id: staff.staffProfile!.id },
        data: {
          ...(data.counterNumber !== undefined && {
            counterNumber: data.counterNumber,
          }),
          ...(data.department !== undefined && {
            department: data.department,
          }),
        },
      });
    }

    return tx.user.update({
      where: { id },
      data: {
        ...(data.fullname && { fullname: data.fullname }),
        ...(data.phone && { phone: data.phone }),
      },
      select: {
        id: true,
        fullname: true,
        email: true,
        phone: true,
        staffProfile: true,
      },
    });
  });

  return updatedStaff;
};

export const deleteStaffService = async (id: string) => {
  const staff = await prisma.user.findFirst({
    where: {
      id,
      role: "STAFF",
      isDeleted: false,
    },
  });

  if (!staff) {
    throw new AppError(404, "Staff not found");
  }

  await prisma.user.update({
    where: { id },
    data: {
      isDeleted: true,
      isActive: false,
    },
  });

  return { message: "Staff deactivated and removed successfully" };
};