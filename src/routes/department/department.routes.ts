import { Router } from "express";
import {
  createDepartment,
  createDesignation,
  deleteDepartment,
  deleteDesignation,
  getAllDepartments,
  getAllDesignations,
  getDoctorConfig,
  updateDepartment,
} from "../../controllers/department/department.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createDepartmentSchema,
  createDesignationSchema,
  updateDepartmentSchema,
} from "../../validators/department.validator";

const router = Router();

router.get("/doctor-config", getDoctorConfig);

router.get("/designations", getAllDesignations);
router.post(
  "/designations",
  authenticate,
  authorize("ADMIN"),
  validate(createDesignationSchema),
  createDesignation
);
router.delete(
  "/designations/:id",
  authenticate,
  authorize("ADMIN"),
  deleteDesignation
);

router.get("/", getAllDepartments);
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createDepartmentSchema),
  createDepartment
);
router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateDepartmentSchema),
  updateDepartment
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  deleteDepartment
);

export default router;