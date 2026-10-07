import type { NextFunction, Request, Response } from 'express';
import {
  createDoctorService,
  getAllDoctorsService,
  getDoctorByIdService,
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
      typeof department === 'string' ? department : undefined;

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
    const doctorId = Array.isArray(id) ? id[0] : id;

    const doctor = await getDoctorByIdService(doctorId);

    res.status(200).json({
      success: true,
      message: 'Doctor profile retrieved successfully',
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};