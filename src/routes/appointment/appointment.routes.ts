import { Router } from "express";
import {
  cancelAppointment,
  createAppointment,
  getAppointmentById,
  getDoctorAppointments,
  getMyAppointments,
  updateAppointmentStatus,
  updateAppointmentDetails,
} from "../../controllers/appointment/appointment.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createAppointmentSchema,
  updateAppointmentDetailsSchema,
  updateAppointmentStatusSchema,
} from "../../validators/appointment.validator";

const router = Router();

router.post(
  "/book",
  (req, res, next) => {
    if (req.headers.authorization) {
      return authenticate(req, res, next);
    }
    next();
  },
  validate(createAppointmentSchema),
  createAppointment
);

router.get(
  "/my-appointments",
  (req, res, next) => {
    if (req.headers.authorization) {
      return authenticate(req, res, next);
    }
    next();
  },
  getMyAppointments
);

router.get(
  "/doctor-schedule",
  authenticate,
  authorize("DOCTOR", "ADMIN", "STAFF"),
  getDoctorAppointments
);

router.get(
  "/",
  authenticate,
  authorize("DOCTOR", "ADMIN", "STAFF"),
  getDoctorAppointments
);

router.get(
  "/:id",
  authenticate,
  authorize("PATIENT", "DOCTOR", "ADMIN", "STAFF"),
  getAppointmentById
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN", "STAFF", "PATIENT"),
  validate(updateAppointmentDetailsSchema),
  updateAppointmentDetails
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("DOCTOR", "ADMIN", "STAFF"),
  validate(updateAppointmentStatusSchema),
  updateAppointmentStatus
);

router.patch(
  "/:id/cancel",
  authenticate,
  authorize("PATIENT", "ADMIN", "DOCTOR", "STAFF"),
  cancelAppointment
);

export default router;