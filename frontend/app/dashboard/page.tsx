'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    CheckCircle2,
    Clock,
    ListTodo,
    LayoutGrid,
    Filter,
} from 'lucide-react';
import { toast } from 'sonner';

import PrivateRoute from '@/components/PrivateRoute';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import StatCard from '@/components/StatCard';
import TaskCard from '@/components/TaskCard';
import TaskDrawer, { DrawerFormData } from '@/components/TaskDrawer';
import EmptyState from '@/components/EmptyState';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { Task, PaginatedTasks } from '@/types';
import axios from 'axios';

type StatusFilter = 'all' | 'todo' | 'in-progress' | 'done';
type PriorityFilter = 'all' | 'low' | 'medium' | 'high';

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
];

// Shimmer skeleton for loading state
function TaskSkeleton({ count = 8 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="shimmer h-48 rounded-2xl" />
            ))}
        </>
    );
}

export default function DashboardPage() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    // ── Data ──────────────────────────────────────────────────────────────────
    const [tasks, setTasks] = useState<Task[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    // ── UI State ──────────────────────────────────────────────────────────────
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    // ── Fetch tasks ──────────────────────────────────────────────────────────
    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = { page, limit: 12 };
            if (statusFilter !== 'all') params.status = statusFilter;
            if (priorityFilter !== 'all') params.priority = priorityFilter;

            const { data } = await api.get<{ success: boolean; data: PaginatedTasks }>(
                '/tasks',
                { params }
            );
            setTasks(data.data.tasks);
            setTotal(data.data.total);
            setTotalPages(data.data.totalPages);
        } catch {
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, priorityFilter]);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    // ── Client-side search filter ─────────────────────────────────────────────
    const filteredTasks = useMemo(() => {
        if (!searchQuery.trim()) return tasks;
        const q = searchQuery.toLowerCase();
        return tasks.filter(
            (t) =>
                t.title.toLowerCase().includes(q) ||
                t.description?.toLowerCase().includes(q)
        );
    }, [tasks, searchQuery]);

    // ── Stats calculation ─────────────────────────────────────────────────────
    const stats = useMemo(() => ({
        total,
        todo: tasks.filter((t) => t.status === 'todo').length,
        inProgress: tasks.filter((t) => t.status === 'in-progress').length,
        done: tasks.filter((t) => t.status === 'done').length,
    }), [tasks, total]);

    // ── CRUD handlers ─────────────────────────────────────────────────────────
    const openCreate = () => { setEditingTask(null); setDrawerOpen(true); };
    const openEdit = (task: Task) => { setEditingTask(task); setDrawerOpen(true); };

    const handleSave = async (data: DrawerFormData, taskId?: string) => {
        try {
            // Strip empty optional fields — empty strings fail Zod .datetime() validation
            const payload: Record<string, unknown> = {
                title: data.title,
                status: data.status,
                priority: data.priority,
            };
            if (data.description?.trim()) payload.description = data.description.trim();
            if (data.dueDate) payload.dueDate = new Date(data.dueDate).toISOString();

            if (taskId) {
                await api.patch(`/tasks/${taskId}`, payload);
                toast.success('Task updated successfully');
            } else {
                await api.post('/tasks', payload);
                toast.success('Task created successfully');
            }
            fetchTasks();
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const errors = err.response?.data?.errors;
                if (errors?.length) {
                    errors.forEach((e: { message: string }) => toast.error(e.message));
                } else {
                    toast.error(err.response?.data?.message ?? 'Something went wrong');
                }
            }
            throw err; // Re-throw so drawer can reset saving state
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/tasks/${id}`);
            // Remove from local state immediately so the card exits via AnimatePresence
            setTasks((prev) => prev.filter((t) => t._id !== id));
            setTotal((prev) => Math.max(0, prev - 1));
            toast.success('Task deleted');
        } catch {
            toast.error('Failed to delete task');
            throw new Error('Delete failed'); // Let TaskCard rollback disabled state
        }
    };

    // ── Optimistic status change (called from TaskCard) ───────────────────────
    const handleStatusChange = async (task: Task, newStatus: Task['status']) => {
        // Update local tasks array immediately so stat cards re-compute
        setTasks((prev) =>
            prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
        );
        try {
            await api.patch(`/tasks/${task._id}`, { status: newStatus });
            // Silent success — card already shows updated status
        } catch (err) {
            // Revert local state on failure
            setTasks((prev) =>
                prev.map((t) => (t._id === task._id ? { ...t, status: task.status } : t))
            );
            toast.error('Could not update task status');
            throw err; // Re-throw so TaskCard can rollback its optimistic state
        }
    };

    return (
        <PrivateRoute>
            <div className="flex h-screen overflow-hidden bg-navy-950">
                {/* ── Sidebar ── */}
                <Sidebar />

                {/* ── Main Column ── */}
                <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                    {/* Topbar */}
                    <Topbar
                        searchQuery={searchQuery}
                        onSearchChange={(v) => setSearchQuery(v)}
                        onNewTask={openCreate}
                    />

                    {/* Scrollable content */}
                    <main className="flex-1 overflow-y-auto px-6 py-6">

                        {/* ── Page Header ── */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6"
                        >
                            <h1 className="text-2xl font-bold text-white tracking-tight">
                                Good {getGreeting()},{' '}
                                <span className="bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">
                                    {user?.name?.split(' ')[0]}
                                </span>{' '}
                                👋
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">
                                Here&apos;s an overview of your workspace today.
                            </p>
                        </motion.div>

                        {/* ── Stat Cards ── */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatCard label="Total Tasks" value={stats.total} icon={LayoutGrid} color="violet" delay={0} />
                            <StatCard label="To Do" value={stats.todo} icon={ListTodo} color="amber" delay={0.05} />
                            <StatCard label="In Progress" value={stats.inProgress} icon={Clock} color="rose" delay={0.1} />
                            <StatCard label="Completed" value={stats.done} icon={CheckCircle2} color="emerald" delay={0.15} />
                        </div>

                        {/* ── Filters Row ── */}
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            {/* Status tabs */}
                            <div className="flex items-center gap-1 p-1 glass rounded-xl">
                                {STATUS_TABS.map((tab) => (
                                    <button
                                        key={tab.value}
                                        onClick={() => { setStatusFilter(tab.value); setPage(1); }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${statusFilter === tab.value
                                            ? 'bg-violet-600/80 text-white shadow-sm'
                                            : 'text-slate-400 hover:text-slate-200'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Priority filter */}
                            <div className="flex items-center gap-1.5">
                                <Filter className="w-3.5 h-3.5 text-slate-500" />
                                <select
                                    value={priorityFilter}
                                    onChange={(e) => { setPriorityFilter(e.target.value as PriorityFilter); setPage(1); }}
                                    className="text-xs bg-white/[0.05] border border-white/[0.08] text-slate-300
                    rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                                >
                                    <option value="all">All Priorities</option>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            {/* Results count */}
                            {searchQuery && (
                                <span className="text-xs text-slate-500 ml-auto">
                                    {filteredTasks.length} result{filteredTasks.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
                                </span>
                            )}
                        </div>

                        {/* ── Task Grid ── */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {loading ? (
                                <TaskSkeleton count={8} />
                            ) : filteredTasks.length === 0 ? (
                                <EmptyState onCreateClick={openCreate} filtered={!!searchQuery || statusFilter !== 'all'} />
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {filteredTasks.map((task, i) => (
                                        <TaskCard
                                            key={task._id}
                                            task={task}
                                            index={i}
                                            onEdit={openEdit}
                                            canDelete={isAdmin}
                                            onDelete={handleDelete}
                                            onStatusChange={handleStatusChange}
                                        />
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>

                        {/* ── Pagination ── */}
                        {totalPages > 1 && !searchQuery && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="btn-ghost disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                                >
                                    ← Prev
                                </button>
                                <span className="text-xs text-slate-500 px-2">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="btn-ghost disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </main>
                </div>

                {/* ── Task Drawer ── */}
                <TaskDrawer
                    open={drawerOpen}
                    task={editingTask}
                    onClose={() => setDrawerOpen(false)}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    canDelete={isAdmin}
                />
            </div>
        </PrivateRoute>
    );
}

function getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
}
