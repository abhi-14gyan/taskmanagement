'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Trash2 } from 'lucide-react';
import { Task } from '@/types';
import { FormEvent, useState, useEffect } from 'react';

interface TaskDrawerProps {
    open: boolean;
    task: Task | null;       // null → create mode
    onClose: () => void;
    onSave: (data: DrawerFormData, taskId?: string) => Promise<void>;
    onDelete?: (id: string) => void;
    canDelete?: boolean;
}

export interface DrawerFormData {
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'done';
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
}

const DEFAULT: DrawerFormData = {
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
};

export default function TaskDrawer({ open, task, onClose, onSave, onDelete, canDelete }: TaskDrawerProps) {
    const [form, setForm] = useState<DrawerFormData>(DEFAULT);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (task) {
            setForm({
                title: task.title,
                description: task.description ?? '',
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
            });
        } else {
            setForm(DEFAULT);
        }
    }, [task, open]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(form, task?._id);
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Slide-over panel */}
                    <motion.aside
                        key="drawer"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
                        className="fixed top-0 right-0 z-50 h-full w-full max-w-md
              glass border-l border-white/[0.08] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
                            <div>
                                <h2 className="font-semibold text-white text-base">
                                    {task ? 'Edit Task' : 'New Task'}
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {task ? 'Update task details below' : 'Fill in the details to create a task'}
                                </p>
                            </div>
                            <button onClick={onClose} className="btn-ghost p-2">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                            {/* Title */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">
                                    Title <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    required
                                    className="input"
                                    placeholder="e.g. Design the landing page"
                                    value={form.title}
                                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">
                                    Description
                                </label>
                                <textarea
                                    rows={4}
                                    className="textarea"
                                    placeholder="Add more context or details..."
                                    value={form.description}
                                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                />
                            </div>

                            {/* Status + Priority */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Status</label>
                                    <select
                                        className="select"
                                        value={form.status}
                                        onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as DrawerFormData['status'] }))}
                                    >
                                        <option value="todo">To Do</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="done">Done</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Priority</label>
                                    <select
                                        className="select"
                                        value={form.priority}
                                        onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as DrawerFormData['priority'] }))}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>

                            {/* Due Date */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Due Date</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={form.dueDate}
                                    onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                                />
                            </div>
                        </form>

                        {/* Footer actions */}
                        <div className="px-6 py-5 border-t border-white/[0.06] flex gap-3">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={saving}
                                className="btn-primary flex-1"
                            >
                                {saving ? (
                                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                                ) : (
                                    <><Save className="w-4 h-4" /> {task ? 'Save Changes' : 'Create Task'}</>
                                )}
                            </button>

                            {task && canDelete && (
                                <button
                                    type="button"
                                    onClick={() => { onDelete?.(task._id); onClose(); }}
                                    className="btn-danger p-2.5 rounded-xl border border-rose-500/20"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
