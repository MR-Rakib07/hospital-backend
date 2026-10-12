import { Router } from "express";
import {
  createStaff,
  deleteStaff,
  getAllStaffs,
  getStaffById,
  updateStaff,
} from "../../controllers/staff/staff.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  createStaffSchema,
  updateStaffSchema,
} from "../../validators/staff.validator";

const router = Router();

router.use(authenticate);

router.get("/", authorize("ADMIN"), getAllStaffs);
router.get("/:id", authorize("ADMIN", "STAFF"), getStaffById);

router.post(
  "/",
  authorize("ADMIN"),
  validate(createStaffSchema),
  createStaff
);

router.patch(
  "/:id",
  authorize("ADMIN", "STAFF"),
  validate(updateStaffSchema),
  updateStaff
);

router.delete("/:id", authorize("ADMIN"), deleteStaff);

export default router;