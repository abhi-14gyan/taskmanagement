'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, Pencil, CheckCheck, Loader2 } from 'lucide-react';
import { Task } from '@/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface TaskCardProps {
    task: Task;
    index: number;
    onEdit: (task: Task) => void;
    canDelete: boolean;
    onDelete: (id: string) => void;
    onStatusChange?: (task: Task, newStatus: Task['status']) => Promise<void>;
}

const STATUS_CONFIG = {
    todo: {
        label: 'To Do',
        pill: 'bg-slate-700/60 text-slate-300 border-slate-600/40',
        dot: 'bg-slate-400',
    },
    'in-progress': {
        label: 'In Progress',
        pill: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
        dot: 'bg-amber-400',
    },
    done: {
        label: 'Completed',
        pill: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
        dot: 'bg-emerald-400',
    },
};

const PRIORITY_CONFIG = {
    low: {
        label: 'Low',
        pill: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
        bar: 'bg-sky-400',
    },
    medium: {
        label: 'Medium',
        pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        bar: 'bg-amber-400',
    },
    high: {
        label: 'High',
        pill: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        bar: 'bg-rose-400',
    },
};

export default function TaskCard({ task, index, onEdit, canDelete, onDelete, onStatusChange }: TaskCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    // Optimistic local status — starts from server state
    const [optimisticStatus, setOptimisticStatus] = useState<Task['status']>(task.status);

    const status = STATUS_CONFIG[optimisticStatus];
    const priority = PRIORITY_CONFIG[task.priority];

    const isDone = optimisticStatus === 'done';

    // ── Optimistic "Mark Complete" / "Reopen" ────────────────────────────────
    const handleToggleComplete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!onStatusChange || isCompleting || isDeleting) return;

        const newStatus: Task['status'] = isDone ? 'todo' : 'done';

        // 1. Update UI immediately (optimistic)
        setOptimisticStatus(newStatus);
        setIsCompleting(true);
        try {
            await onStatusChange(task, newStatus);
        } catch {
            // 2. Rollback on failure
            setOptimisticStatus(task.status);
        } finally {
            setIsCompleting(false);
        }
    };

    // ── Delete with loading state ─────────────────────────────────────────────
    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isDeleting || isCompleting) return;
        setIsDeleting(true);
        try {
            await onDelete(task._id);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35, delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
            whileHover={{ y: -3, scale: 1.01 }}
            className={cn(
                'glass glass-hover group relative flex flex-col gap-3 p-5 cursor-pointer',
                isDone && 'opacity-75',
                isDeleting && 'opacity-40 pointer-events-none'
            )}
            onClick={() => !isDeleting && !isCompleting && onEdit(task)}
        >
            {/* Priority top bar */}
            <div className={cn('absolute top-0 left-6 right-6 h-px rounded-b-full opacity-60', priority.bar)} />

            {/* Header row */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                    {/* Status pill — reflects optimistic state */}
                    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border', status.pill)}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                        {status.label}
                    </span>
                    {/* Priority pill */}
                    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border', priority.pill)}>
                        ↑ {priority.label}
                    </span>
                </div>

                {/* Edit button (hover reveal) */}
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                    disabled={isDeleting || isCompleting}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg
            hover:bg-white/10 text-slate-400 hover:text-slate-100 disabled:opacity-0"
                    aria-label="Edit task"
                >
                    <Pencil className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Title — strikethrough when done */}
            <h3 className={cn(
                'font-semibold text-slate-100 text-sm leading-snug line-clamp-2 transition-all',
                isDone && 'line-through text-slate-400'
            )}>
                {task.title}
            </h3>

            {/* Description */}
            {task.description && (
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {task.description}
                </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/[0.05]">
                {/* Assignee */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[9px] font-bold text-white">
                        {typeof task.assignedTo === 'object' && task.assignedTo?.name
                            ? task.assignedTo.name[0].toUpperCase()
                            : <User className="w-2.5 h-2.5" />}
                    </div>
                    <span>
                        {typeof task.assignedTo === 'object' && task.assignedTo?.name
                            ? task.assignedTo.name.split(' ')[0]
                            : 'Unassigned'}
                    </span>
                </div>

                {/* Due date */}
                {task.dueDate && (
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                )}
            </div>

            {/* ── Hover Action Row ──────────────────────────────────────── */}
            <AnimatePresence>
                <div className="absolute bottom-3 right-3 flex items-center gap-1
                    opacity-0 group-hover:opacity-100 transition-opacity">

                    {/* Mark Complete / Reopen — optimistic */}
                    {onStatusChange && (
                        <button
                            onClick={handleToggleComplete}
                            disabled={isCompleting || isDeleting}
                            className={cn(
                                'flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all',
                                'disabled:opacity-40 disabled:cursor-not-allowed',
                                isDone
                                    ? 'text-slate-400 hover:bg-white/10 hover:text-slate-200'
                                    : 'text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300'
                            )}
                            aria-label={isDone ? 'Reopen task' : 'Mark as complete'}
                        >
                            {isCompleting
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <CheckCheck className="w-3 h-3" />
                            }
                            {isDone ? 'Reopen' : 'Done'}
                        </button>
                    )}

                    {/* Delete — admin only */}
                    {canDelete && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting || isCompleting}
                            className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-400
                                px-2 py-1 rounded-lg hover:bg-rose-500/10 transition-all
                                disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Delete task"
                        >
                            {isDeleting
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : 'Delete'
                            }
                        </button>
                    )}
                </div>
            </AnimatePresence>
        </motion.div>
    );
}
