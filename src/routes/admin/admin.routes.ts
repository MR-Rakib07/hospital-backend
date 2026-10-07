import { Router } from 'express';
import {
  getAdminStats,
  getAllUsers,
  getUserById,
  createAdmin,
  updateUserRole,
  updateUserInfo,
  deleteUserByAdmin,
} from '../../controllers/admin/admin.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/authorize.middleware';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/create-admin', createAdmin);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id', updateUserInfo);
router.delete('/users/:id', deleteUserByAdmin);

export default router;