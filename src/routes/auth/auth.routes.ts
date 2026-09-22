import { Router } from 'express';
import { changePassword, getMe, login, logout, refreshToken, register, updateProfile } from '../../controllers/auth/auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { registerUserSchema, loginUserSchema, updateProfileSchema } from '../../validators/user.validatores';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/register', validate(registerUserSchema), register);
router.post('/login',validate(loginUserSchema),login)
router.post('/refresh-token',refreshToken)
router.post("/logout", logout);
router.get("/me", authenticate, getMe);
router.post("/change-password", authenticate, changePassword)
router.patch("/profile",authenticate,validate(updateProfileSchema),updateProfile);


export default router;