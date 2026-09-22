import { Router } from 'express';
import { register } from '../../controllers/auth/auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import { registerUserSchema, loginUserSchema } from '../../validators/user.validatores';

const router = Router();

router.post('/register', validate(registerUserSchema), register);


export default router;