import { AdminRepository } from './admin.repository';
import { UpdateRoleInput } from './admin.schema';
import { IUser } from '../../models/User.model';

export class AdminService {
    private repo = new AdminRepository();

    async listUsers(): Promise<IUser[]> {
        return this.repo.findAllUsers();
    }

    async assignRole(
        targetUserId: string,
        requestingUserId: string,
        data: UpdateRoleInput
    ): Promise<IUser> {
        // Prevent an admin from accidentally demoting themselves
        // (would lock them out with no other admin to fix it)
        if (targetUserId === requestingUserId) {
            const err = new Error(
                'You cannot change your own role. Ask another admin.'
            ) as any;
            err.statusCode = 400;
            throw err;
        }

        const target = await this.repo.findById(targetUserId);
        if (!target) {
            const err = new Error('User not found') as any;
            err.statusCode = 404;
            throw err;
        }

        // No-op guard: skip DB write if role is already set
        if (target.role === data.role) {
            const err = new Error(
                `User already has the role '${data.role}'`
            ) as any;
            err.statusCode = 409;
            throw err;
        }

        const updated = await this.repo.updateUserRole(targetUserId, data);
        if (!updated) {
            const err = new Error('Failed to update role') as any;
            err.statusCode = 500;
            throw err;
        }

        return updated;
    }
}
