import { Router } from "express";
import {
  createDoctor,
  deleteDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
} from "../../controllers/doctor/doctor.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createDoctorSchema,
  updateDoctorSchema,
} from "../../validators/doctor.validator";

const router = Router();

router.get("/", getAllDoctors);
router.get("/:id", getDoctorById);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createDoctorSchema),
  createDoctor
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateDoctorSchema),
  updateDoctor
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  deleteDoctor
);

export default router;