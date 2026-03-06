import { z } from 'zod';

// Helper — converts empty string to undefined so .datetime() isn't triggered on ""
const optionalDatetime = z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v))
    .pipe(z.string().datetime({ message: 'Due date must be a valid ISO 8601 date' }).optional());

export const createTaskSchema = z.object({
    title: z
        .string({ required_error: 'Title is required' })
        .trim()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title cannot exceed 100 characters'),

    description: z
        .string()
        .trim()
        .max(1000, 'Description cannot exceed 1000 characters')
        .optional(),

    status: z
        .enum(['todo', 'in-progress', 'done'], {
            errorMap: () => ({ message: 'Status must be todo, in-progress, or done' }),
        })
        .optional()
        .default('todo'),

    priority: z
        .enum(['low', 'medium', 'high'], {
            errorMap: () => ({ message: 'Priority must be low, medium, or high' }),
        })
        .optional()
        .default('medium'),

    assignedTo: z.string().optional(),
    dueDate: optionalDatetime,
});

// ── Update schema: NO .default() so partial PATCH fields are never overwritten ──
// e.g. PATCH { status: 'done' } should NOT silently add status: 'todo'
export const updateTaskSchema = z.object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters').max(100).optional(),
    description: z.string().trim().max(1000).optional(),
    status: z.enum(['todo', 'in-progress', 'done']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    assignedTo: z.string().optional(),
    dueDate: optionalDatetime,
});

export const taskQuerySchema = z.object({
    status: z.enum(['todo', 'in-progress', 'done']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    page: z.string().regex(/^\d+$/).optional().transform(Number).default('1' as any),
    limit: z.string().regex(/^\d+$/).optional().transform(Number).default('10' as any),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
