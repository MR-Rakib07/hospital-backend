import type { NextFunction, Request, Response } from "express";
import {
  createDepartmentService,
  createDesignationService,
  getAllDepartmentsService,
  getAllDesignationsService,
  getDoctorConfigService,
  updateDepartmentService,
} from "../../services/department/department.services";

export const getDoctorConfig = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const config = await getDoctorConfigService();

    res.status(200).json({
      success: true,
      message: "Doctor configuration fetched successfully",
      data: config,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllDepartments = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const departments = await getAllDepartmentsService();

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
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
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

export const createDesignation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const designation = await createDesignationService(req.body.name);

    res.status(201).json({
      success: true,
      message: "Designation created successfully",
      data: designation,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllDesignations = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const designations = await getAllDesignationsService();

    res.status(200).json({
      success: true,
      message: "Designations fetched successfully",
      data: designations,
    });
  } catch (error) {
    next(error);
  }
};