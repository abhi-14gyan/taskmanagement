import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';

const adminService = new AdminService();

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/admin/users
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: List all users [Admin only]
 *     description: >
 *       Returns a full list of all registered users (passwords excluded),
 *       sorted by registration date (newest first).
 *
 *       🔒 **Requires `admin` role.**
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User list returned successfully
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
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UserProfile'
 *                     total:
 *                       type: integer
 *                       example: 5
 *             example:
 *               success: true
 *               data:
 *                 total: 2
 *                 users:
 *                   - _id: "64b2f0ef8e1a2c001f3d9abc"
 *                     name: "Jane Doe"
 *                     email: "jane@example.com"
 *                     role: "user"
 *                     createdAt: "2024-07-16T09:00:00.000Z"
 *                   - _id: "64c1a2bc9e3f4d001b8e5678"
 *                     name: "Admin User"
 *                     email: "admin@example.com"
 *                     role: "admin"
 *                     createdAt: "2024-07-15T08:00:00.000Z"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export const listUsers = async (
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const users = await adminService.listUsers();
        res.status(200).json({
            success: true,
            data: { total: users.length, users },
        });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/admin/users/:id/role
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/admin/users/{id}/role:
 *   patch:
 *     summary: Assign a role to a user [Admin only]
 *     description: >
 *       Updates the `role` field of the specified user.
 *       The role change takes effect on the user's next login
 *       (their current JWT still carries the old role until it expires or they re-login).
 *
 *       **Business rules:**
 *       - An admin **cannot change their own role** (prevents accidental self-lockout)
 *       - Returns `409` if the user already has the requested role
 *       - Returns `404` if the target user does not exist
 *
 *       🔒 **Requires `admin` role.**
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the target user
 *         example: "64b2f0ef8e1a2c001f3d9abc"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, manager, admin]
 *                 example: "manager"
 *           examples:
 *             promote_to_manager:
 *               summary: Promote to manager
 *               value:
 *                 role: "manager"
 *             promote_to_admin:
 *               summary: Promote to admin
 *               value:
 *                 role: "admin"
 *             demote_to_user:
 *               summary: Demote back to user
 *               value:
 *                 role: "user"
 *     responses:
 *       200:
 *         description: Role updated successfully
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
 *                   example: "Role updated to 'manager'"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/UserProfile'
 *             example:
 *               success: true
 *               message: "Role updated to 'manager'"
 *               data:
 *                 user:
 *                   _id: "64b2f0ef8e1a2c001f3d9abc"
 *                   name: "Jane Doe"
 *                   email: "jane@example.com"
 *                   role: "manager"
 *       400:
 *         description: Admin attempted to change their own role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "You cannot change your own role. Ask another admin."
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: User already has the requested role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "User already has the role 'manager'"
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
export const assignRole = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user = await adminService.assignRole(
            req.params.id,
            req.user!.id,
            req.body            // already validated by Zod middleware
        );
        res.status(200).json({
            success: true,
            message: `Role updated to '${user.role}'`,
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};
