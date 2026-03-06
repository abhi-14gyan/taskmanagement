import { Task, ITask } from '../../models/Task.model';
import { CreateTaskInput, UpdateTaskInput } from './task.schema';
import mongoose from 'mongoose';

interface FindAllOptions {
    userId?: string;
    isAdmin: boolean;
    status?: string;
    priority?: string;
    page: number;
    limit: number;
}

export class TaskRepository {
    async findAll(options: FindAllOptions): Promise<{ tasks: ITask[]; total: number }> {
        const { userId, isAdmin, status, priority, page, limit } = options;
        const skip = (page - 1) * limit;

        // Admins/managers see all tasks; users see only their own (assigned or created)
        const filter: mongoose.FilterQuery<ITask> = {};
        if (!isAdmin) {
            filter.$or = [
                { assignedTo: new mongoose.Types.ObjectId(userId) },
                { createdBy: new mongoose.Types.ObjectId(userId) },
            ];
        }
        if (status) filter.status = status;
        if (priority) filter.priority = priority;

        const [tasks, total] = await Promise.all([
            Task.find(filter)
                .populate('assignedTo', 'name email')
                .populate('createdBy', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Task.countDocuments(filter),
        ]);

        return { tasks: tasks as unknown as ITask[], total };
    }

    async findById(id: string): Promise<ITask | null> {
        return Task.findById(id)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');
    }

    async create(data: CreateTaskInput & { createdBy: string }): Promise<ITask> {
        const task = new Task(data);
        return task.save();
    }

    async update(id: string, data: UpdateTaskInput): Promise<ITask | null> {
        return Task.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
    }

    async delete(id: string): Promise<ITask | null> {
        return Task.findByIdAndDelete(id);
    }
}
