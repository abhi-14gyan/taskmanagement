import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { MongoServerError } from 'mongodb';

interface AppError extends Error {
    statusCode?: number;
}

export const errorHandler = (
    err: AppError,
    _req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
): void => {
    // ── Zod Validation Errors ──────────────────────────────────────────────────
    if (err instanceof ZodError) {
        res.status(422).json({
            success: false,
            message: 'Validation error',
            errors: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
        return;
    }

    // ── MongoDB Duplicate Key (e.g. unique email) ──────────────────────────────
    if (err instanceof MongoServerError && err.code === 11000) {
        const field = Object.keys((err as any).keyValue)[0];
        res.status(409).json({
            success: false,
            message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
        });
        return;
    }

    // ── Custom App Errors with statusCode ─────────────────────────────────────
    const statusCode = err.statusCode ?? 500;
    const message =
        process.env.NODE_ENV === 'production' && statusCode === 500
            ? 'Internal server error'
            : err.message || 'Internal server error';

    res.status(statusCode).json({ success: false, message });
};
