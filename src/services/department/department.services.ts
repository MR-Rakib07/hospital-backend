import prisma from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import type {
  CreateDepartmentInput,
  UpdateDepartmentInput,
  CreateDesignationInput,
  UpdateDesignationInput,
} from "../../validators/department.validator";

export const getConfigByRoleService = async (roleType: "DOCTOR" | "STAFF") => {
  const [departments, designations] = await Promise.all([
    prisma.department.findMany({
      where: { roleType },
      select: {
        id: true,
        name: true,
        roleType: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.designation.findMany({
      where: { roleType },
      select: {
        id: true,
        name: true,
        roleType: true,
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
  const trimmedName = data.name.trim();

  const existingDept = await prisma.department.findFirst({
    where: {
      name: trimmedName,
      roleType: data.roleType,
    },
  });

  if (existingDept) {
    throw new AppError(400, "Department already exists for this role");
  }

  return await prisma.department.create({
    data: {
      name: trimmedName,
      roleType: data.roleType,
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

  const targetName = data.name ? data.name.trim() : department.name;
  const targetRole = data.roleType ?? department.roleType;

  if (data.name || data.roleType) {
    const nameConflict = await prisma.department.findFirst({
      where: {
        name: targetName,
        roleType: targetRole,
        NOT: { id },
      },
    });

    if (nameConflict) {
      throw new AppError(400, "Department with this name already exists for this role");
    }
  }

  return await prisma.department.update({
    where: { id },
    data: {
      ...(data.name && { name: targetName }),
      ...(data.roleType && { roleType: targetRole }),
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

  if (department.roleType === "DOCTOR") {
    const assignedDoctor = await prisma.doctorProfile.findFirst({
      where: { department: department.name },
    });
    if (assignedDoctor) {
      throw new AppError(
        400,
        "Cannot delete department because doctors are currently assigned to it"
      );
    }
  }

  await prisma.department.delete({
    where: { id },
  });

  return { message: "Department deleted successfully" };
};

export const getAllDepartmentsService = async (roleType?: "DOCTOR" | "STAFF") => {
  return await prisma.department.findMany({
    where: roleType ? { roleType } : undefined,
    orderBy: {
      name: "asc",
    },
  });
};

export const createDesignationService = async (data: CreateDesignationInput) => {
  const trimmedName = data.name.trim();

  const existingDesignation = await prisma.designation.findFirst({
    where: {
      name: trimmedName,
      roleType: data.roleType,
    },
  });

  if (existingDesignation) {
    throw new AppError(400, "Designation already exists for this role");
  }

  return await prisma.designation.create({
    data: {
      name: trimmedName,
      roleType: data.roleType,
    },
  });
};

export const updateDesignationService = async (
  id: string,
  data: UpdateDesignationInput
) => {
  const designation = await prisma.designation.findUnique({
    where: { id },
  });

  if (!designation) {
    throw new AppError(404, "Designation not found");
  }

  const targetName = data.name ? data.name.trim() : designation.name;
  const targetRole = data.roleType ?? designation.roleType;

  if (data.name || data.roleType) {
    const nameConflict = await prisma.designation.findFirst({
      where: {
        name: targetName,
        roleType: targetRole,
        NOT: { id },
      },
    });

    if (nameConflict) {
      throw new AppError(400, "Designation with this name already exists for this role");
    }
  }

  return await prisma.designation.update({
    where: { id },
    data: {
      ...(data.name && { name: targetName }),
      ...(data.roleType && { roleType: targetRole }),
    },
  });
};

export const deleteDesignationService = async (id: string) => {
  const designation = await prisma.designation.findUnique({
    where: { id },
  });

  if (!designation) {
    throw new AppError(404, "Designation not found");
  }

  if (designation.roleType === "DOCTOR") {
    const assignedDoctor = await prisma.doctorProfile.findFirst({
      where: { designation: designation.name },
    });
    if (assignedDoctor) {
      throw new AppError(
        400,
        "Cannot delete designation because doctors are currently assigned to it"
      );
    }
  }

  await prisma.designation.delete({
    where: { id },
  });

  return { message: "Designation deleted successfully" };
};

export const getAllDesignationsService = async (roleType?: "DOCTOR" | "STAFF") => {
  return await prisma.designation.findMany({
    where: roleType ? { roleType } : undefined,
    orderBy: {
      name: "asc",
    },
  });
};