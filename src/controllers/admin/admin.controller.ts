import type { NextFunction, Request, Response } from 'express';
import {
  getAdminStatsService,
  getAllUsersService,
  getUserByIdService,
  createAdminByAdminService,
  updateUserRoleService,
  updateUserInfoByAdminService,
  deleteUserByAdminService,
} from '../../services/admin/admin.services';

export const getAdminStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await getAdminStatsService();
    res.status(200).json({
      success: true,
      message: 'Admin statistics retrieved successfully',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { role } = req.query;
    const roleFilter = typeof role === 'string' ? role : undefined;

    const users = await getAllUsersService(roleFilter);
    res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await getUserByIdService(id);

    res.status(200).json({
      success: true,
      message: 'User details fetched successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const createAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const newAdmin = await createAdminByAdminService(req.body);
    res.status(201).json({
      success: true,
      message: 'New Admin created successfully',
      data: newAdmin,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const updatedUser = await updateUserRoleService(id, role);
    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserInfo = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedUser = await updateUserInfoByAdminService(id, req.body);

    res.status(200).json({
      success: true,
      message: 'User info updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserByAdmin = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await deleteUserByAdminService(id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};