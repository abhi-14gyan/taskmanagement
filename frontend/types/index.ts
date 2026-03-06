export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'user';
    createdAt: string;
}

export interface Task {
    _id: string;
    title: string;
    description?: string;
    status: 'todo' | 'in-progress' | 'done';
    priority: 'low' | 'medium' | 'high';
    assignedTo?: Pick<User, '_id' | 'name' | 'email'>;
    createdBy: Pick<User, '_id' | 'name' | 'email'>;
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedTasks {
    tasks: Task[];
    total: number;
    page: number;
    totalPages: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: { field: string; message: string }[];
}
