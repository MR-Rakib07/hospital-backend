import prisma from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import type {
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from "../../validators/department.validator";

export const getDoctorConfigService = async () => {
  const [departments, designations] = await Promise.all([
    prisma.department.findMany({
      select: {
        id: true,
        name: true,
        specializations: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.designation.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return {
    departments,
    designations: designations.map((d) => d.name),
  };
};

export const createDepartmentService = async (data: CreateDepartmentInput) => {
  const existingDept = await prisma.department.findUnique({
    where: { name: data.name },
  });

  if (existingDept) {
    throw new AppError(400, "Department already exists");
  }

  return await prisma.department.create({
    data: {
      name: data.name,
      specializations: data.specializations,
    },
  });
};

export const updateDepartmentService = async (
  id: string,
  data: UpdateDepartmentInput
) => {
  const department = await prisma.department.findUnique({
    where: { id },
  });

  if (!department) {
    throw new AppError(404, "Department not found");
  }

  if (data.name && data.name !== department.name) {
    const nameConflict = await prisma.department.findUnique({
      where: { name: data.name },
    });
    if (nameConflict) {
      throw new AppError(400, "Department with this name already exists");
    }
  }

  return await prisma.department.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.specializations && { specializations: data.specializations }),
    },
  });
};

export const deleteDepartmentService = async (id: string) => {
  const department = await prisma.department.findUnique({
    where: { id },
  });

  if (!department) {
    throw new AppError(404, "Department not found");
  }

  const assignedDoctor = await prisma.doctorProfile.findFirst({
    where: { department: department.name },
  });

  if (assignedDoctor) {
    throw new AppError(
      400,
      "Cannot delete department because doctors are currently assigned to it"
    );
  }

  await prisma.department.delete({
    where: { id },
  });

  return { message: "Department deleted successfully" };
};

export const getAllDepartmentsService = async () => {
  return await prisma.department.findMany({
    orderBy: {
      name: "asc",
    },
  });
};

export const createDesignationService = async (name: string) => {
  const trimmedName = name.trim();
  const existingDesignation = await prisma.designation.findUnique({
    where: { name: trimmedName },
  });

  if (existingDesignation) {
    throw new AppError(400, "Designation already exists");
  }

  return await prisma.designation.create({
    data: { name: trimmedName },
  });
};

export const deleteDesignationService = async (id: string) => {
  const designation = await prisma.designation.findUnique({
    where: { id },
  });

  if (!designation) {
    throw new AppError(404, "Designation not found");
  }

  const assignedDoctor = await prisma.doctorProfile.findFirst({
    where: { designation: designation.name },
  });

  if (assignedDoctor) {
    throw new AppError(
      400,
      "Cannot delete designation because doctors are currently assigned to it"
    );
  }

  await prisma.designation.delete({
    where: { id },
  });

  return { message: "Designation deleted successfully" };
};

export const getAllDesignationsService = async () => {
  return await prisma.designation.findMany({
    orderBy: {
      name: "asc",
    },
  });
};