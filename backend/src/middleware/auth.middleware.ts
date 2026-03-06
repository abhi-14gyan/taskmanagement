import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRole } from '../models/User.model';

interface JwtPayload {
    id: string;
    email: string;
    role: UserRole;
}

// ── isAuthenticated ──────────────────────────────────────────────────────────
// Reads JWT from HttpOnly cookie, verifies it, and attaches user to req
export const isAuthenticated = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const token = req.cookies?.token as string | undefined;

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Not authenticated. Please log in.',
            });
            return;
        }

        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
        req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
        next();
    } catch {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired session. Please log in again.',
        });
    }
};

// ── authorizeRoles ───────────────────────────────────────────────────────────
// Variadic factory: authorizeRoles('admin', 'manager') returns middleware that
// allows only those roles through. Returns 403 for any other authenticated user.
//
// Usage:
//   router.delete('/:id', isAuthenticated, authorizeRoles('admin'), deleteTask);
//   router.get('/', isAuthenticated, authorizeRoles('admin', 'manager', 'user'), getAllTasks);
export const authorizeRoles = (...roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Access denied: Unauthorized role.',
            });
            return;
        }
        next();
    };
};

// Backward-compatible alias (existing routes import authorizeRole)
export const authorizeRole = authorizeRoles;
