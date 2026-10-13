import { Router } from "express";
import {
  createDepartment,
  createDesignation,
  deleteDepartment,
  deleteDesignation,
  getAllDepartments,
  getAllDesignations,
  getConfigByRole,
  updateDepartment,
  updateDesignation,
} from "../../controllers/department/department.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createDepartmentSchema,
  createDesignationSchema,
  updateDepartmentSchema,
  updateDesignationSchema,
} from "../../validators/department.validator";

const router = Router();

router.get("/config", getConfigByRole);

router.get("/designations", getAllDesignations);
router.post(
  "/designations",
  authenticate,
  authorize("ADMIN"),
  validate(createDesignationSchema),
  createDesignation
);
router.patch(
  "/designations/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateDesignationSchema),
  updateDesignation
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