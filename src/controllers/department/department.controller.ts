import type { NextFunction, Request, Response } from "express";
import {
  createDepartmentService,
  createDesignationService,
  deleteDepartmentService,
  deleteDesignationService,
  getAllDepartmentsService,
  getAllDesignationsService,
  getConfigByRoleService,
  updateDepartmentService,
  updateDesignationService,
} from "../../services/department/department.services";

export const getConfigByRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const roleType = (req.query.roleType as "DOCTOR" | "STAFF") || "DOCTOR";
    const config = await getConfigByRoleService(roleType);

    res.status(200).json({
      success: true,
      message: `${roleType} configuration fetched successfully`,
      data: config,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllDepartments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const roleType = req.query.roleType as "DOCTOR" | "STAFF" | undefined;
    const departments = await getAllDepartmentsService(roleType);

    res.status(200).json({
      success: true,
      message: "Departments fetched successfully",
      data: departments,
    });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const department = await createDepartmentService(req.body);

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const department = await updateDepartmentService(id, req.body);

    res.status(200).json({
      success: true,
      message: "Department updated successfully",
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await deleteDepartmentService(id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllDesignations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const roleType = req.query.roleType as "DOCTOR" | "STAFF" | undefined;
    const designations = await getAllDesignationsService(roleType);

    res.status(200).json({
      success: true,
      message: "Designations fetched successfully",
      data: designations,
    });
  } catch (error) {
    next(error);
  }
};

export const createDesignation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const designation = await createDesignationService(req.body);

    res.status(201).json({
      success: true,
      message: "Designation created successfully",
      data: designation,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDesignation = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const designation = await updateDesignationService(id, req.body);

    res.status(200).json({
      success: true,
      message: "Designation updated successfully",
      data: designation,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDesignation = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await deleteDesignationService(id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};