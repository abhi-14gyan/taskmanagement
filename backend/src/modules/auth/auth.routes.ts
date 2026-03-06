import { Router } from 'express';
import { register, login, logout, getMe } from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { isAuthenticated } from '../../middleware/auth.middleware';
import { registerSchema, loginSchema } from './auth.schema';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', isAuthenticated, getMe);

export default router;
