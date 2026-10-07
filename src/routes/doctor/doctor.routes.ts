import { Router } from "express";
import {
  createDoctor,
  getAllDoctors,
  getDoctorById,
} from "../../controllers/doctor/doctor.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createDoctorSchema } from "../../validators/user.validatores";

const router = Router();

router.get("/", getAllDoctors);
router.get("/:id", getDoctorById);
router.post(
  "/create",
  authenticate,
  authorize("ADMIN"),
  validate(createDoctorSchema),
  createDoctor
);

export default router;