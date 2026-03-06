import { UserRole } from '../models/User.model';

// Extends Express Request to include the authenticated user payload
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: UserRole;
            };
        }
    }
}
