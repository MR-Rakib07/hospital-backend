import { Router } from "express"
import {
  cancelAppointment,
  createAppointment,
  getDoctorAppointments,
  getMyAppointments,
  updateAppointmentStatus,
} from "../../controllers/appointment/appointment.controller"
import { authenticate } from "../../middlewares/auth.middleware"
import { authorize } from "../../middlewares/authorize.middleware"
import { validate } from "../../middlewares/validate.middleware"
import {
  createAppointmentSchema,
  updateAppointmentStatusSchema,
} from "../../validators/appointment.validator"

const router = Router()

router.post(
  "/book",
  authenticate,
  authorize("PATIENT"),
  validate(createAppointmentSchema),
  createAppointment
)

router.get(
  "/my-appointments",
  authenticate,
  authorize("PATIENT"),
  getMyAppointments
)

router.get(
  "/doctor-schedule",
  authenticate,
  authorize("DOCTOR", "ADMIN"),
  getDoctorAppointments
)

router.get(
  "/",
  authenticate,
  authorize("DOCTOR", "ADMIN"),
  getDoctorAppointments
)

router.patch(
  "/:id/status",
  authenticate,
  authorize("DOCTOR", "ADMIN"),
  validate(updateAppointmentStatusSchema),
  updateAppointmentStatus
)

router.patch(
  "/:id/cancel",
  authenticate,
  authorize("PATIENT", "ADMIN", "DOCTOR"),
  cancelAppointment
)

export default router