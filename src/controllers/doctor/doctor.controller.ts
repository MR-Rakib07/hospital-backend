import type { NextFunction, Request, Response } from 'express';
import {
  createDoctorService,
  getAllDoctorsService,
  getDoctorByIdService,
  updateDoctorService,
  deleteDoctorService,
} from '../../services/doctor/doctor.services';

export const createDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const doctor = await createDoctorService(req.body);

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllDoctors = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { department } = req.query;
    const departmentFilter =
      typeof department === 'string' && department.trim().length > 0
        ? department.trim()
        : undefined;

    const doctors = await getAllDoctorsService(departmentFilter);

    res.status(200).json({
      success: true,
      message: 'Doctors fetched successfully',
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Doctor ID is required',
      });
      return;
    }

    const doctor = await getDoctorByIdService(id);

    res.status(200).json({
      success: true,
      message: 'Doctor profile retrieved successfully',
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDoctor = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Doctor ID is required',
      });
      return;
    }

    const updatedDoctor = await updateDoctorService(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully',
      data: updatedDoctor,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDoctor = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Doctor ID is required',
      });
      return;
    }

    const result = await deleteDoctorService(id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};