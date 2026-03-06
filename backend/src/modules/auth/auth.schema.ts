import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// Registration
// ─────────────────────────────────────────────────────────────────────────────
// Security: role is EXCLUDED from the registration schema entirely.
// A new user always starts as 'user'. Only an admin can elevate roles
// via a separate admin endpoint — never via self-registration.
//
// If the client sends `"role": "admin"` in the body, it is silently stripped
// by Zod's .strict() equivalent (the validate middleware calls .parse(), which
// discards unknown keys by default — Zod strips extra fields).
export const registerSchema = z.object({
    name: z
        .string({ required_error: 'Name is required' })
        .trim()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name cannot exceed 50 characters'),

    email: z
        .string({ required_error: 'Email is required' })
        .email('Please provide a valid email address')
        .toLowerCase(),

    password: z
        .string({ required_error: 'Password is required' })
        .min(8, 'Password must be at least 8 characters')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),

    // role is intentionally NOT in this schema.
    // Whatever the client sends as "role" will be stripped.
    // The auth.service always hard-codes role: 'user' on creation.
});

// ─────────────────────────────────────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
    email: z
        .string({ required_error: 'Email is required' })
        .email('Please provide a valid email address')
        .toLowerCase(),

    password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
