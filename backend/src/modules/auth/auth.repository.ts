import { User, IUser } from '../../models/User.model';
import { RegisterInput } from './auth.schema';

export class AuthRepository {
    async findByEmail(email: string): Promise<IUser | null> {
        // select('+password') overrides the schema-level select:false
        return User.findOne({ email }).select('+password');
    }

    async findById(id: string): Promise<IUser | null> {
        return User.findById(id);
    }

    async create(data: RegisterInput & { role: 'user' }): Promise<IUser> {
        const user = new User(data);
        return user.save();
    }
}
