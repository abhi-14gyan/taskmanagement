'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    CheckSquare,
    ChevronLeft,
    ChevronRight,
    Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

// Only real, wired routes — Team/Settings removed (no pages exist)
const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: CheckSquare, label: 'My Tasks', href: '/dashboard' },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    return (
        <motion.aside
            animate={{ width: collapsed ? 72 : 240 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative flex flex-col h-full shrink-0 overflow-hidden
        glass border-r border-white/[0.06] rounded-none"
        >
            {/* ── Logo ── */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.06]">
                <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600
          flex items-center justify-center shadow-glow-sm">
                    <Zap className="w-4 h-4 text-white" />
                </div>
                <AnimatePresence>
                    {!collapsed && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="font-bold text-base bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent whitespace-nowrap"
                        >
                            TaskFlow
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Navigation ── */}
            <nav className="flex-1 px-2 py-4 space-y-1">
                {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={label}
                            href={href}
                            className={cn('sidebar-link', isActive && 'active')}
                        >
                            <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-violet-400' : 'text-slate-500')} />
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -8 }}
                                        transition={{ duration: 0.15 }}
                                        className="whitespace-nowrap"
                                    >
                                        {label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>
                    );
                })}
            </nav>

            {/* ── Collapse Toggle ── */}
            <div className="px-2 pb-4">
                <button
                    onClick={() => setCollapsed((c) => !c)}
                    className="w-full sidebar-link justify-center"
                    aria-label="Toggle sidebar"
                >
                    {collapsed ? (
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                    ) : (
                        <>
                            <ChevronLeft className="w-4 h-4 text-slate-500" />
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-slate-500 text-xs"
                            >
                                Collapse
                            </motion.span>
                        </>
                    )}
                </button>
            </div>
        </motion.aside>
    );
}
