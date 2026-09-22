import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma";
import type { LoginUserInput, RegisterUserInput, UpdateProfileInput } from "../../validators/user.validatores";
import { AppError } from "../../errors/AppError";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";
import jwt from "jsonwebtoken";
interface ChangePasswordInput {
  userId: string;
  oldPassword: string;
  newPassword: string;
}

// registerUser
export const registerUser = async (data: RegisterUserInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AppError(409, "User is already registered");
  }

  const hashedPass = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      ...data,
      password: hashedPass,
    },
  });

  const { password: _, ...safeUser } = user;
  return safeUser;
};

// loginUser
export const loginUser = async (data: LoginUserInput) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email }
  })
  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }
  const isPasswordMatch = await bcrypt.compare(data.password, user.password);

  if (!isPasswordMatch) {
    throw new AppError(401, "Invalid email or password");
  }
  const payload = {
    id: user.id,
    email: user.email
  }
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
  };
}

// refreshAccessToken
export const refreshAccessToken = async (token: string) => {
  if (!token) {
    throw new AppError(401, "Refresh token is missing");
  }

  let decoded: any;
  try {
    const secret = process.env.JWT_REFRESH_SECRET || "refresh_secret_key";
    decoded = jwt.verify(token, secret);
  } catch (err) {
    throw new AppError(403, "Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const newAccessToken = generateAccessToken({
    id: user.id,
    email: user.email,
  });

  return { accessToken: newAccessToken };
};

// Getme
export const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }
  const { password: _, ...safeUser } = user;

  return safeUser;
};

// changePasswordService
export const changePasswordService = async ({
  userId,
  oldPassword,
  newPassword,
}: ChangePasswordInput) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordMatch) {
    throw new AppError(400, "Old password is incorrect");
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });

  return { message: "Password updated successfully" };
};

// updateProfileService
export const updateProfileService = async (
  userId: string,
  payload: UpdateProfileInput
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const updateData: any = { ...payload };

  if (payload.dateOfBirth) {
    updateData.dateOfBirth = new Date(payload.dateOfBirth);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  const { password: _, ...safeUser } = updatedUser;
  return safeUser;
};