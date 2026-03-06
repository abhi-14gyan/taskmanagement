'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import GlassCard from './GlassCard';

interface StatCardProps {
    label: string;
    value: number | string;
    icon: LucideIcon;
    color: 'violet' | 'amber' | 'emerald' | 'rose';
    delay?: number;
}

const colorMap = {
    violet: {
        iconBg: 'bg-violet-500/15',
        iconColor: 'text-violet-400',
        bar: 'bg-gradient-to-r from-violet-500 to-indigo-500',
        glow: 'shadow-[0_0_20px_rgba(139,92,246,0.2)]',
    },
    amber: {
        iconBg: 'bg-amber-500/15',
        iconColor: 'text-amber-400',
        bar: 'bg-gradient-to-r from-amber-400 to-orange-500',
        glow: 'shadow-[0_0_20px_rgba(251,191,36,0.15)]',
    },
    emerald: {
        iconBg: 'bg-emerald-500/15',
        iconColor: 'text-emerald-400',
        bar: 'bg-gradient-to-r from-emerald-400 to-teal-500',
        glow: 'shadow-[0_0_20px_rgba(52,211,153,0.15)]',
    },
    rose: {
        iconBg: 'bg-rose-500/15',
        iconColor: 'text-rose-400',
        bar: 'bg-gradient-to-r from-rose-400 to-pink-500',
        glow: 'shadow-[0_0_20px_rgba(251,113,133,0.15)]',
    },
};

export default function StatCard({ label, value, icon: Icon, color, delay = 0 }: StatCardProps) {
    const c = colorMap[color];
    return (
        <GlassCard
            className={`p-5 ${c.glow}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${c.iconColor}`} />
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.iconBg} ${c.iconColor}`}>
                    Live
                </span>
            </div>
            <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
            <p className="text-sm text-slate-400 mt-1">{label}</p>
            {/* Decorative accent bar */}
            <div className={`mt-4 h-0.5 w-full rounded-full opacity-40 ${c.bar}`} />
        </GlassCard>
    );
}
