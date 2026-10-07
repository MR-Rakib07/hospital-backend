import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma';
import { AppError } from '../../errors/AppError';

export const getAdminStatsService = async () => {
  const [totalUsers, totalPatients, totalDoctors, totalAdmins] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'PATIENT' } }),
    prisma.user.count({ where: { role: 'DOCTOR' } }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
  ]);

  return {
    totalUsers,
    totalPatients,
    totalDoctors,
    totalAdmins,
  };
};

export const getAllUsersService = async (role?: string) => {
  const filter: Record<string, unknown> = {};

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
      createdAt: true,
      doctorProfile: true,
      adminProfile: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return users;
};

export const getUserByIdService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullname: true,
      phone: true,
      role: true,
      createdAt: true,
      doctorProfile: true,
      adminProfile: true,
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

export const updateUserRoleService = async (
  userId: string,
  newRole: 'PATIENT' | 'DOCTOR' | 'ADMIN'
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
    select: {
      id: true,
      email: true,
      fullname: true,
      role: true,
    },
  });

  return updatedUser;
};

export const updateUserInfoByAdminService = async (
  userId: string,
  data: { fullname?: string; phone?: string }
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      fullname: data.fullname ?? user.fullname,
      phone: data.phone ?? user.phone,
    },
    select: {
      id: true,
      email: true,
      fullname: true,
      phone: true,
      role: true,
    },
  });

  return updatedUser;
};

export const deleteUserByAdminService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      doctorProfile: true,
      adminProfile: true,
    },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  await prisma.$transaction(async (tx) => {
    if (user.doctorProfile) {
      await tx.doctorProfile.delete({ where: { userId } });
    }
    if (user.adminProfile) {
      await tx.adminProfile.delete({ where: { userId } });
    }
    await tx.user.delete({ where: { id: userId } });
  });

  return { message: 'User and related profile deleted successfully' };
};