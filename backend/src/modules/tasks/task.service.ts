import { TaskRepository } from './task.repository';
import { CreateTaskInput, UpdateTaskInput, TaskQueryInput } from './task.schema';
import { ITask } from '../../models/Task.model';
import { Types } from 'mongoose';

// Safely extract string ID from either a raw ObjectId or a populated sub-document
function extractId(val: unknown): string {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (val instanceof Types.ObjectId) return val.toHexString();
    // Populated Mongoose document — has an _id field
    if (typeof val === 'object' && '_id' in (val as object)) {
        return String((val as { _id: unknown })._id);
    }
    return String(val);
}

export class TaskService {
    private repo = new TaskRepository();

    async getAllTasks(
        userId: string,
        role: string,
        query: TaskQueryInput
    ): Promise<{ tasks: ITask[]; total: number; page: number; totalPages: number }> {
        const isAdmin = role === 'admin' || role === 'manager';
        const { status, priority, page, limit } = query;

        const { tasks, total } = await this.repo.findAll({
            userId,
            isAdmin,
            status,
            priority,
            page,
            limit,
        });

        return { tasks, total, page, totalPages: Math.ceil(total / limit) };
    }

    async getTaskById(id: string, userId: string, role: string): Promise<ITask> {
        const task = await this.repo.findById(id);
        if (!task) {
            const err = new Error('Task not found') as any;
            err.statusCode = 404;
            throw err;
        }
        // Non-admins can only view tasks they own or are assigned to
        const isAdmin = role === 'admin' || role === 'manager';
        const isOwner =
            extractId(task.createdBy) === userId ||
            extractId(task.assignedTo) === userId;

        if (!isAdmin && !isOwner) {
            const err = new Error('Access denied') as any;
            err.statusCode = 403;
            throw err;
        }

        return task;
    }

    async createTask(data: CreateTaskInput, userId: string): Promise<ITask> {
        return this.repo.create({ ...data, createdBy: userId });
    }

    async updateTask(id: string, data: UpdateTaskInput, userId: string, role: string): Promise<ITask> {
        const task = await this.repo.findById(id);
        if (!task) {
            const err = new Error('Task not found') as any;
            err.statusCode = 404;
            throw err;
        }

        const isAdmin = role === 'admin' || role === 'manager';
        const isOwner = extractId(task.createdBy) === userId;
        if (!isAdmin && !isOwner) {
            const err = new Error('You can only update tasks you created') as any;
            err.statusCode = 403;
            throw err;
        }

        const updated = await this.repo.update(id, data);
        return updated!;
    }

    async deleteTask(id: string, userId: string, role: string): Promise<void> {
        const task = await this.repo.findById(id);
        if (!task) {
            const err = new Error('Task not found') as any;
            err.statusCode = 404;
            throw err;
        }

        const isAdmin = role === 'admin';
        const isOwner = extractId(task.createdBy) === userId;

        // Admins can delete ANY task.
        // Regular users (and managers) can only delete tasks they created.
        if (!isAdmin && !isOwner) {
            const err = new Error('Access denied: Unauthorized role.') as any;
            err.statusCode = 403;
            throw err;
        }

        await this.repo.delete(id);
    }
}
