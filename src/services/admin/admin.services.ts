import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma';
import { AppError } from '../../errors/AppError';
import type { Role } from '@prisma/client';
import type { CreateStaffInput } from '../../validators/staff.validator';

export const getAdminStatsService = async () => {
  const [
    totalUsers,
    totalPatients,
    totalDoctors,
    totalStaffs,
    totalAdmins,
    totalAppointments,
  ] = await Promise.all([
    prisma.user.count({ where: { isDeleted: false } }),
    prisma.user.count({ where: { role: 'PATIENT', isDeleted: false } }),
    prisma.user.count({ where: { role: 'DOCTOR', isDeleted: false } }),
    prisma.user.count({ where: { role: 'STAFF', isDeleted: false } }),
    prisma.user.count({ where: { role: 'ADMIN', isDeleted: false } }),
    prisma.appointment.count(),
  ]);

  return {
    totalUsers,
    totalPatients,
    totalDoctors,
    totalStaffs,
    totalAdmins,
    totalAppointments,
  };
};

export const getAllUsersService = async (role?: string) => {
  const filter: Record<string, unknown> = {
    isDeleted: false,
  };

  if (role) {
    filter.role = role.toUpperCase();
  }

  const users = await prisma.user.findMany({
    where: filter,
    select: {
      id: true,
      email: true,
      fullname: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
      doctorProfile: true,
      adminProfile: true,
      staffProfile: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return users;
};

export const getUserByIdService = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      isDeleted: false,
    },
    select: {
      id: true,
      email: true,
      fullname: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
      doctorProfile: true,
      adminProfile: true,
      staffProfile: true,
    },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return user;
};

export const createAdminByAdminService = async (data: {
  email: string;
  password: string;
  fullname: string;
  phone: string;
  designation?: string;
  department?: string;
}) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AppError(400, 'User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newAdmin = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      fullname: data.fullname,
      phone: data.phone,
      role: 'ADMIN',
      adminProfile: {
        create: {
          designation: data.designation || 'Administrator',
          department: data.department || 'Operations',
        },
      },
    },
    select: {
      id: true,
      email: true,
      fullname: true,
      phone: true,
      role: true,
      adminProfile: true,
    },
  });

  return newAdmin;
};

export const createStaffByAdminService = async (data: CreateStaffInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AppError(400, 'User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newStaff = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      fullname: data.fullname,
      phone: data.phone,
      role: 'STAFF',
      staffProfile: {
        create: {
          counterNumber: data.counterNumber,
          department: data.department,
        },
      },
    },
    select: {
      id: true,
      email: true,
      fullname: true,
      phone: true,
      role: true,
      staffProfile: true,
    },
  });

  return newStaff;
};

export const updateUserRoleService = async (
  userId: string,
  newRole: Role
) => {
  const user = await prisma.user.findFirst({
    where: { id: userId, isDeleted: false },
    include: {
      staffProfile: true,
      adminProfile: true,
      doctorProfile: true,
    },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const updatedUser = await prisma.$transaction(async (tx) => {
    if (newRole === 'STAFF' && !user.staffProfile) {
      await tx.staffProfile.create({ data: { userId } });
    } else if (newRole === 'ADMIN' && !user.adminProfile) {
      await tx.adminProfile.create({ data: { userId } });
    }

    return tx.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        fullname: true,
        role: true,
        staffProfile: true,
        adminProfile: true,
        doctorProfile: true,
      },
    });
  });

  return updatedUser;
};

export const updateUserInfoByAdminService = async (
  userId: string,
  data: {
    fullname?: string;
    phone?: string;
    isActive?: boolean;
    counterNumber?: string;
    department?: string;
  }
) => {
  const user = await prisma.user.findFirst({
    where: { id: userId, isDeleted: false },
    include: {
      staffProfile: true,
      adminProfile: true,
    },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const updatedUser = await prisma.$transaction(async (tx) => {
    if (user.role === 'STAFF' && user.staffProfile && (data.counterNumber !== undefined || data.department !== undefined)) {
      await tx.staffProfile.update({
        where: { userId },
        data: {
          ...(data.counterNumber !== undefined && { counterNumber: data.counterNumber }),
          ...(data.department !== undefined && { department: data.department }),
        },
      });
    }

    if (user.role === 'ADMIN' && user.adminProfile && data.department !== undefined) {
      await tx.adminProfile.update({
        where: { userId },
        data: { department: data.department },
      });
    }

    return tx.user.update({
      where: { id: userId },
      data: {
        ...(data.fullname && { fullname: data.fullname }),
        ...(data.phone && { phone: data.phone }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      select: {
        id: true,
        email: true,
        fullname: true,
        phone: true,
        role: true,
        isActive: true,
        staffProfile: true,
        adminProfile: true,
        doctorProfile: true,
      },
    });
  });

  return updatedUser;
};

export const deleteUserByAdminService = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: { id: userId, isDeleted: false },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      isDeleted: true,
      isActive: false,
    },
  });

  return { message: 'User deactivated and deleted successfully' };
};