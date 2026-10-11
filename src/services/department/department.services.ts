import prisma from "../../lib/prisma"
import { AppError } from "../../errors/AppError"

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
  ])

  return {
    departments,
    designations: designations.map((d) => d.name),
  }
}

export const createDepartmentService = async (data: {
  name: string
  specializations: string[]
}) => {
  const existingDept = await prisma.department.findUnique({
    where: { name: data.name },
  })

  if (existingDept) {
    throw new AppError(400, "Department already exists")
  }

  return await prisma.department.create({
    data: {
      name: data.name,
      specializations: data.specializations,
    },
  })
}

export const updateDepartmentService = async (
  id: string,
  data: { name?: string; specializations?: string[] }
) => {
  const department = await prisma.department.findUnique({
    where: { id },
  })

  if (!department) {
    throw new AppError(404, "Department not found")
  }

  return await prisma.department.update({
    where: { id },
    data,
  })
}

export const getAllDepartmentsService = async () => {
  return await prisma.department.findMany({
    orderBy: {
      name: "asc",
    },
  })
}

export const createDesignationService = async (name: string) => {
  const existingDesignation = await prisma.designation.findUnique({
    where: { name },
  })

  if (existingDesignation) {
    throw new AppError(400, "Designation already exists")
  }

  return await prisma.designation.create({
    data: { name },
  })
}

export const getAllDesignationsService = async () => {
  return await prisma.designation.findMany({
    orderBy: {
      name: "asc",
    },
  })
}