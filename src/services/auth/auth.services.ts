import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma";
import type { RegisterUserInput } from "../../validators/user.validatores";
import { AppError } from "../../errors/AppError";

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