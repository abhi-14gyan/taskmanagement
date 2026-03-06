import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

// Generic middleware factory — validates req.body against any Zod schema
export const validate =
    (schema: AnyZodObject) =>
        (req: Request, res: Response, next: NextFunction): void => {
            try {
                req.body = schema.parse(req.body);
                next();
            } catch (error) {
                if (error instanceof ZodError) {
                    const errors = error.errors.map((e) => ({
                        field: e.path.join('.'),
                        message: e.message,
                    }));
                    res.status(422).json({
                        success: false,
                        message: 'Validation failed',
                        errors,
                    });
                    return;
                }
                next(error);
            }
        };
