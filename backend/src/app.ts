import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './modules/auth/auth.routes';
import taskRoutes from './modules/tasks/task.routes';
import adminRoutes from './modules/admin/admin.routes';

const app = express();

// ── Security & Parsing Middleware ──────────────────────────────────────────────
app.use(
    helmet({
        contentSecurityPolicy: false, // Allows Swagger UI to render
    })
);
app.use(
    cors({
        origin: (origin, callback) => {
            // Development: allow any localhost port
            if (env.NODE_ENV === 'development') {
                if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
                    return callback(null, true);
                }
            }
            // Production: allow CLIENT_URL + any Vercel preview deployment
            const vercelPreview = /^https:\/\/[\w-]+(\.[\w-]+)*\.vercel\.app$/.test(origin ?? '');
            if (origin === env.CLIENT_URL || vercelPreview) {
                return callback(null, true);
            }
            callback(new Error(`CORS: origin ${origin} not allowed`));
        },
        credentials: true, // Required for HttpOnly cookies cross-origin
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);
app.use(express.json({ limit: '10kb' })); // Prevent massive payload attacks
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(env.COOKIE_SECRET));
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// ── Swagger / OpenAPI ──────────────────────────────────────────────────────────
const swaggerOptions: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'TaskFlow API',
            version: '1.0.0',
            description: `
## TaskFlow — Task Management REST API

A production-grade REST API with **JWT Authentication** (HttpOnly cookies) and **Role-Based Access Control (RBAC)**.

### Authentication
All protected endpoints require a valid JWT stored in an \`HttpOnly\` cookie named \`token\`.
1. Call \`POST /api/v1/auth/register\` to create an account
2. Call \`POST /api/v1/auth/login\` — this sets the \`token\` cookie automatically
3. All subsequent requests will be authenticated via the cookie

### Roles & Permissions
| Role | Tasks visible | Can update | Can delete |
|------|--------------|------------|------------|
| \`user\` | Own + assigned | Own only | ❌ |
| \`manager\` | All tasks | All tasks | ❌ |
| \`admin\` | All tasks | All tasks | ✅ |

> ⚠️ **Swagger UI limitation:** Browsers block HttpOnly cookies in cross-origin Swagger requests.
> Use **Postman** or the frontend app at \`http://localhost:3000\` to test authenticated endpoints.
            `,
            contact: {
                name: 'TaskFlow API Support',
                email: 'support@taskflow.dev',
            },
            license: {
                name: 'MIT',
            },
        },
        servers: [
            {
                url: `http://localhost:${env.PORT}/api/v1`,
                description: 'Local development server',
            },
            {
                url: `${env.CLIENT_URL ? env.CLIENT_URL.replace('3000', '5000') : 'https://your-backend.onrender.com'}/api/v1`,
                description: 'Production server (Render)',
            },
        ],
        tags: [
            {
                name: 'Auth',
                description: '🔐 Authentication — register, login, logout, and session management',
            },
            {
                name: 'Tasks',
                description: '📋 Tasks — full CRUD with filtering, pagination, and RBAC',
            },
            {
                name: 'Admin',
                description: '🛡️ Admin — user management and role assignment (admin role required)',
            },
        ],
    },
    // Scan controllers for JSDoc annotations
    apis: [
        './src/modules/auth/auth.controller.ts',
        './src/modules/tasks/task.controller.ts',
        './src/modules/admin/admin.controller.ts',
    ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// ── Health Check ───────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ── API v1 Routes ──────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/admin', adminRoutes);  // 🔒 Admin-only: protected by authorizeRoles('admin')

// ── 404 Handler ────────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
