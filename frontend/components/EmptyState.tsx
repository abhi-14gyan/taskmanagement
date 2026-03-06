'use client';

import { motion } from 'framer-motion';
import { ClipboardList, Plus } from 'lucide-react';

interface EmptyStateProps {
    onCreateClick: () => void;
    filtered?: boolean;
}

export default function EmptyState({ onCreateClick, filtered = false }: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="col-span-full flex flex-col items-center justify-center py-24 text-center"
        >
            {/* Animated icon container */}
            <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="relative mb-6"
            >
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20
          border border-violet-500/20 flex items-center justify-center
          shadow-[0_0_40px_rgba(139,92,246,0.15)]">
                    <ClipboardList className="w-10 h-10 text-violet-400" />
                </div>
                {/* Decorative dots */}
                <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-violet-500/30 blur-sm" />
                <div className="absolute -bottom-1 -left-2 w-3 h-3 rounded-full bg-indigo-500/20 blur-sm" />
            </motion.div>

            <h3 className="text-lg font-semibold text-slate-200 mb-1.5">
                {filtered ? 'No matching tasks' : 'No tasks yet'}
            </h3>
            <p className="text-slate-500 text-sm max-w-xs mb-6">
                {filtered
                    ? 'Try adjusting your search or filters to find what you\'re looking for.'
                    : 'Get started by creating your first task. Stay organized and productive.'}
            </p>

            {!filtered && (
                <button onClick={onCreateClick} className="btn-primary">
                    <Plus className="w-4 h-4" />
                    Create your first task
                </button>
            )}
        </motion.div>
    );
}
