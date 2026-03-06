import { Request, Response, NextFunction } from 'express';
import { TaskService } from './task.service';
import { taskQuerySchema } from './task.schema';

const taskService = new TaskService();

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/tasks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: List tasks (paginated, filterable)
 *     description: >
 *       Returns a paginated list of tasks.
 *       **Role behaviour:**
 *       - `admin` / `manager` — sees **all** tasks in the system
 *       - `user` — sees only tasks they **created** or are **assigned to**
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in-progress, done]
 *         description: Filter by task status
 *         example: "in-progress"
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filter by task priority
 *         example: "high"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (1-indexed)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Paginated task list returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PaginatedTasks'
 *             example:
 *               success: true
 *               data:
 *                 tasks:
 *                   - _id: "64c3a1ff9b2e5d001a7f1234"
 *                     title: "Design the landing page"
 *                     description: "Wireframes and final Figma mockup"
 *                     status: "in-progress"
 *                     priority: "high"
 *                     assignedTo:
 *                       _id: "64b2f0ef8e1a2c001f3d9abc"
 *                       name: "Jane Doe"
 *                       email: "jane@example.com"
 *                     createdBy:
 *                       _id: "64b2f0ef8e1a2c001f3d9abc"
 *                       name: "Jane Doe"
 *                       email: "jane@example.com"
 *                     dueDate: "2024-12-31T00:00:00.000Z"
 *                     createdAt: "2024-07-16T09:00:00.000Z"
 *                     updatedAt: "2024-07-17T10:30:00.000Z"
 *                 total: 1
 *                 page: 1
 *                 totalPages: 1
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
export const getAllTasks = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const query = taskQuerySchema.parse(req.query);
        const result = await taskService.getAllTasks(req.user!.id, req.user!.role, query);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/tasks/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Get a single task by ID
 *     description: >
 *       Returns full details for a task.
 *       A `user` can only fetch a task they **created** or are **assigned to**.
 *       Admins and managers can fetch any task.
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the task
 *         example: "64c3a1ff9b2e5d001a7f1234"
 *     responses:
 *       200:
 *         description: Task detail returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     task:
 *                       $ref: '#/components/schemas/Task'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
export const getTaskById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const task = await taskService.getTaskById(req.params.id, req.user!.id, req.user!.role);
        res.status(200).json({ success: true, data: { task } });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/tasks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create a new task
 *     description: >
 *       Creates a task. `createdBy` is automatically set to the authenticated user.
 *       The `assignedTo` field accepts a user ObjectId — leave it empty to leave the task unassigned.
 *       `status` defaults to `todo` and `priority` defaults to `medium` if omitted.
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: "Implement user authentication"
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "JWT-based auth with HttpOnly cookies and refresh tokens"
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, done]
 *                 default: todo
 *                 example: "todo"
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *                 example: "high"
 *               assignedTo:
 *                 type: string
 *                 description: MongoDB ObjectId of the user to assign this task to
 *                 example: "64b2f0ef8e1a2c001f3d9abc"
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: ISO 8601 datetime string
 *                 example: "2024-12-31T00:00:00.000Z"
 *           examples:
 *             minimal:
 *               summary: Minimal task (title only)
 *               value:
 *                 title: "Fix login bug"
 *             full:
 *               summary: Full task with all fields
 *               value:
 *                 title: "Implement user authentication"
 *                 description: "JWT + HttpOnly cookies + refresh token rotation"
 *                 status: "todo"
 *                 priority: "high"
 *                 assignedTo: "64b2f0ef8e1a2c001f3d9abc"
 *                 dueDate: "2024-12-31T00:00:00.000Z"
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Task created"
 *                 data:
 *                   type: object
 *                   properties:
 *                     task:
 *                       $ref: '#/components/schemas/Task'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
export const createTask = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const task = await taskService.createTask(req.body, req.user!.id);
        res.status(201).json({ success: true, message: 'Task created', data: { task } });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/tasks/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   patch:
 *     summary: Update a task (partial update)
 *     description: >
 *       Updates one or more fields on a task. Only the fields you provide will be changed
 *       — all other fields remain as-is.
 *
 *       **Authorization:**
 *       - `admin` / `manager` — can update **any** task
 *       - `user` — can only update tasks they **created**
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the task to update
 *         example: "64c3a1ff9b2e5d001a7f1234"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, done]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               assignedTo:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *           examples:
 *             mark_done:
 *               summary: Mark task as complete
 *               value:
 *                 status: "done"
 *             change_priority:
 *               summary: Escalate priority
 *               value:
 *                 priority: "high"
 *             full_update:
 *               summary: Update multiple fields
 *               value:
 *                 title: "Redesign dashboard"
 *                 status: "in-progress"
 *                 priority: "high"
 *                 dueDate: "2024-12-31T00:00:00.000Z"
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Task updated"
 *                 data:
 *                   type: object
 *                   properties:
 *                     task:
 *                       $ref: '#/components/schemas/Task'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
export const updateTask = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const task = await taskService.updateTask(req.params.id, req.body, req.user!.id, req.user!.role);
        res.status(200).json({ success: true, message: 'Task updated', data: { task } });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/tasks/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     description: >
 *       **Permanently** deletes a task. This action is **irreversible**.
 *
 *       **Authorization rules:**
 *       - `admin` — can delete **any** task
 *       - `user` / `manager` — can delete only tasks **they created**
 *
 *       Returns 403 if the authenticated user is neither the creator nor an admin.
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the task to delete
 *         example: "64c3a1ff9b2e5d001a7f1234"
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Task deleted successfully"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Access denied — admin role required"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
export const deleteTask = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        await taskService.deleteTask(req.params.id, req.user!.id, req.user!.role);
        res.status(200).json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
        next(error);
    }
};
