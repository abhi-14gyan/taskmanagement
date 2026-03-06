import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { IUser } from '../../models/User.model';
import { AuthRepository } from './auth.repository';
import { RegisterInput, LoginInput } from './auth.schema';

export class AuthService {
    private repo = new AuthRepository();

    async register(data: RegisterInput): Promise<Omit<IUser, 'password'>> {
        const existing = await this.repo.findByEmail(data.email);
        if (existing) {
            const err = new Error('An account with this email already exists') as any;
            err.statusCode = 409;
            throw err;
        }
        // Hard-code role:'user' — never trust client-supplied role at registration.
        // Even if the schema were to accidentally allow a role field, this ensures
        // no self-escalation to admin/manager is possible.
        const createData: RegisterInput & { role: 'user' } = { ...data, role: 'user' };
        const user = await this.repo.create(createData);
        const { password: _pw, ...safeUser } = user.toObject();
        return safeUser as Omit<IUser, 'password'>;
    }

    async login(data: LoginInput): Promise<{ user: Omit<IUser, 'password'>; token: string }> {
        const user = await this.repo.findByEmail(data.email);
        if (!user) {
            const err = new Error('Invalid email or password') as any;
            err.statusCode = 401;
            throw err;
        }

        const isMatch = await user.comparePassword(data.password);
        if (!isMatch) {
            const err = new Error('Invalid email or password') as any;
            err.statusCode = 401;
            throw err;
        }

        const token = jwt.sign(
            { id: user._id.toString(), email: user.email, role: user.role },
            env.JWT_SECRET,
            { expiresIn: env.JWT_EXPIRES_IN as any }
        );

        const { password: _pw, ...safeUser } = user.toObject();
        return { user: safeUser as Omit<IUser, 'password'>, token };
    }

    async getProfile(userId: string): Promise<IUser | null> {
        return this.repo.findById(userId);
    }
}
