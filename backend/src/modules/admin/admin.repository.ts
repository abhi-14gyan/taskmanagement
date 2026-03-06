import { User, IUser } from '../../models/User.model';
import { UpdateRoleInput } from './admin.schema';

export class AdminRepository {
    // Return all users, sorted newest first, password excluded
    async findAllUsers(): Promise<IUser[]> {
        return User.find({}).select('-password').sort({ createdAt: -1 }).lean() as unknown as IUser[];
    }

    // Update a single user's role and return the updated document
    async updateUserRole(
        userId: string,
        data: UpdateRoleInput
    ): Promise<IUser | null> {
        return User.findByIdAndUpdate(
            userId,
            { $set: { role: data.role } },
            { new: true, runValidators: true }
        ).select('-password');
    }

    async findById(userId: string): Promise<IUser | null> {
        return User.findById(userId).select('-password');
    }
}
