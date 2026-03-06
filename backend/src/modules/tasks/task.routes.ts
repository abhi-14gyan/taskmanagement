import { Router } from 'express';
import {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
} from './task.controller';
import { validate } from '../../middleware/validate.middleware';
import { isAuthenticated, authorizeRoles } from '../../middleware/auth.middleware';
import { createTaskSchema, updateTaskSchema } from './task.schema';

const router = Router();

// ── All task routes require a valid JWT session ───────────────────────────────
router.use(isAuthenticated);

// ── GET /api/v1/tasks ─────────────────────────────────────────────────────────
// All roles can call this. The SERVICE layer handles scoping:
//   • admin / manager → see ALL tasks
//   • user            → sees only tasks they created or are assigned to
router.get('/', getAllTasks);

// ── GET /api/v1/tasks/:id ─────────────────────────────────────────────────────
// All roles allowed. Service enforces: user must be owner or assignee.
router.get('/:id', getTaskById);

// ── POST /api/v1/tasks ────────────────────────────────────────────────────────
// All roles can create tasks.
router.post('/', validate(createTaskSchema), createTask);

// ── PATCH /api/v1/tasks/:id ───────────────────────────────────────────────────
// All roles can attempt an update. Service enforces:
//   • admin / manager → can update any task
//   • user            → can only update tasks they created
router.patch('/:id', validate(updateTaskSchema), updateTask);

// ── DELETE /api/v1/tasks/:id ──────────────────────────────────────────────────
// No role gate at the route level — the SERVICE handles the RBAC split:
//   • admin   → can delete ANY task
//   • user / manager → can only delete tasks THEY created (403 otherwise)
// Removing the route-level admin guard lets the service return the correct
// 403 message ('Access denied: Unauthorized role.') for all failure cases,
// keeping error messaging consistent with every other RBAC check in this app.
router.delete('/:id', deleteTask);

export default router;
