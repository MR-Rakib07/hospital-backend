import type { NextFunction, Request, Response } from "express";
import {
  createStaffService,
  deleteStaffService,
  getAllStaffsService,
  getStaffByIdService,
  updateStaffService,
} from "../../services/staff/staff.services";

export const createStaff = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const staff = await createStaffService(req.body);

    res.status(201).json({
      success: true,
      message: "Staff created successfully",
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllStaffs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { department } = req.query;
    const departmentFilter =
      typeof department === "string" && department.trim().length > 0
        ? department.trim()
        : undefined;

    const staffs = await getAllStaffsService(departmentFilter);

    res.status(200).json({
      success: true,
      message: "Staff list fetched successfully",
      data: staffs,
    });
  } catch (error) {
    next(error);
  }
};

export const getStaffById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Staff ID is required",
      });
      return;
    }

    const staff = await getStaffByIdService(id);

    res.status(200).json({
      success: true,
      message: "Staff details retrieved successfully",
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStaff = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Staff ID is required",
      });
      return;
    }

    const updatedStaff = await updateStaffService(id, req.body);

    res.status(200).json({
      success: true,
      message: "Staff profile updated successfully",
      data: updatedStaff,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStaff = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Staff ID is required",
      });
      return;
    }

    const result = await deleteStaffService(id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};