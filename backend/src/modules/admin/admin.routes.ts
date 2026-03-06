import { Router } from 'express';
import { listUsers, assignRole } from './admin.controller';
import { isAuthenticated, authorizeRoles } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { updateRoleSchema } from './admin.schema';

const router = Router();

// All admin routes require authentication + admin role
router.use(isAuthenticated, authorizeRoles('admin'));

/**
 * GET  /api/v1/admin/users          — list all users
 * PATCH /api/v1/admin/users/:id/role — update a user's role
 */
router.get('/users', listUsers);
router.patch('/users/:id/role', validate(updateRoleSchema), assignRole);

export default router;
