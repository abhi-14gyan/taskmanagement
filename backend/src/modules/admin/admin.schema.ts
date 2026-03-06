import { z } from 'zod';
import { UserRole } from '../../models/User.model';

// ── PATCH /api/v1/admin/users/:id/role ────────────────────────────────────────
export const updateRoleSchema = z.object({
    role: z.enum(['user', 'manager', 'admin'], {
        required_error: 'role is required',
        invalid_type_error: "role must be one of: 'user', 'manager', 'admin'",
    }),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
