import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { env } from '../../config/env';

const authService = new AuthService();

const isProduction = env.NODE_ENV === 'production';

// In production (Vercel → Render = cross-origin): sameSite must be 'none' + secure:true
// In development (same host): sameSite:'strict' is fine and more secure
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: isProduction,                          // HTTPS only in production
    sameSite: (isProduction ? 'none' : 'strict') as 'none' | 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,              // 7 days in ms
};

const CLEAR_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? 'none' : 'strict') as 'none' | 'strict',
};


// ─────────────────────────────────────────────────────────────────────────────
// Swagger Component Schemas (defined once, referenced everywhere)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64b2f0ef8e1a2c001f3d9abc"
 *         name:
 *           type: string
 *           example: "Jane Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "jane@example.com"
 *         role:
 *           type: string
 *           enum: [user, manager, admin]
 *           example: "user"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-07-16T09:00:00.000Z"
 *
 *     Task:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64c3a1ff9b2e5d001a7f1234"
 *         title:
 *           type: string
 *           example: "Design the landing page"
 *         description:
 *           type: string
 *           example: "Wireframes and final Figma mockup"
 *         status:
 *           type: string
 *           enum: [todo, in-progress, done]
 *           example: "todo"
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *           example: "high"
 *         assignedTo:
 *           $ref: '#/components/schemas/UserProfile'
 *         createdBy:
 *           $ref: '#/components/schemas/UserProfile'
 *         dueDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2024-12-31T00:00:00.000Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     PaginatedTasks:
 *       type: object
 *       properties:
 *         tasks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Task'
 *         total:
 *           type: integer
 *           example: 42
 *         page:
 *           type: integer
 *           example: 1
 *         totalPages:
 *           type: integer
 *           example: 4
 *
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Something went wrong"
 *
 *     ValidationErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Validation failed"
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *               message:
 *                 type: string
 *           example:
 *             - field: "email"
 *               message: "Invalid email address"
 *             - field: "password"
 *               message: "Must contain at least 1 uppercase letter and 1 number"
 *
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: token
 *       description: >
 *         JWT stored in an HttpOnly cookie. Automatically sent by the browser.
 *         Use the `/auth/login` endpoint first to receive the cookie.
 *
 *   responses:
 *     Unauthorized:
 *       description: Missing or invalid JWT cookie
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             success: false
 *             message: "Not authenticated — please log in"
 *     Forbidden:
 *       description: Authenticated but insufficient role permissions
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             success: false
 *             message: "Access denied"
 *     NotFound:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             success: false
 *             message: "Task not found"
 *     ValidationError:
 *       description: Request body failed Zod schema validation
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ValidationErrorResponse'
 */

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/register
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user account
 *     description: >
 *       Creates a new user. Password must be at least 8 characters and contain
 *       at least 1 uppercase letter and 1 number. Returns the created user profile.
 *       Does **not** auto-login — call `/auth/login` after registration.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: "Jane Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jane@example.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: "Min 8 chars, 1 uppercase, 1 number"
 *                 example: "Password123"
 *               role:
 *                 type: string
 *                 enum: [user, manager, admin]
 *                 default: user
 *                 description: "Defaults to 'user' if omitted"
 *                 example: "user"
 *           examples:
 *             regular_user:
 *               summary: Standard user registration
 *               value:
 *                 name: "Jane Doe"
 *                 email: "jane@example.com"
 *                 password: "Password123"
 *             admin_user:
 *               summary: Admin registration
 *               value:
 *                 name: "Admin User"
 *                 email: "admin@example.com"
 *                 password: "Admin1234"
 *                 role: "admin"
 *     responses:
 *       201:
 *         description: Account created successfully
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
 *                   example: "Account created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/UserProfile'
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Email already in use"
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user = await authService.register(req.body);
        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/login
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login and receive a JWT session cookie
 *     description: >
 *       Authenticates the user and sets a **HttpOnly, SameSite=Strict** cookie
 *       named `token` containing a signed JWT valid for 7 days.
 *       The cookie is automatically sent on all subsequent requests — no manual
 *       `Authorization` header is needed.
 *
 *       ⚠️ **Swagger UI Note:** Swagger UI cannot automatically send HttpOnly cookies
 *       in cross-origin requests. To test protected endpoints from Swagger, use a
 *       browser-based client or Postman with cookie support enabled.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jane@example.com"
 *               password:
 *                 type: string
 *                 example: "Password123"
 *           example:
 *             email: "jane@example.com"
 *             password: "Password123"
 *     responses:
 *       200:
 *         description: Login successful — `token` HttpOnly cookie is set
 *         headers:
 *           Set-Cookie:
 *             description: "HttpOnly JWT cookie: `token=<jwt>; Path=/; HttpOnly; SameSite=Strict`"
 *             schema:
 *               type: string
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
 *                   example: "Logged in successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Invalid email or password"
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { user, token } = await authService.login(req.body);
        res.cookie('token', token, COOKIE_OPTIONS);
        res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/logout
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout and clear the session cookie
 *     description: >
 *       Clears the `token` HttpOnly cookie. No request body required.
 *       Always returns 200, even if the user was not logged in.
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out — cookie has been cleared
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Logged out successfully"
 */
export const logout = (_req: Request, res: Response): void => {
    res.clearCookie('token', CLEAR_COOKIE_OPTIONS);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/auth/me
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get the currently authenticated user's profile
 *     description: >
 *       Returns the full profile of the user identified by the JWT cookie.
 *       Use this to hydrate the frontend session on page load.
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user's profile
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
 *                     user:
 *                       $ref: '#/components/schemas/UserProfile'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
export const getMe = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user = await authService.getProfile(req.user!.id);
        res.status(200).json({ success: true, data: { user } });
    } catch (error) {
        next(error);
    }
};
