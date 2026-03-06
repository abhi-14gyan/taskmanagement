'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, ChevronDown, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function UserAvatar() {
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const [signingOut, setSigningOut] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const initials = user?.name
        ?.split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() ?? 'U';

    const handleLogout = async () => {
        setSigningOut(true);
        try {
            await logout();
        } finally {
            setSigningOut(false);
        }
    };

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl
          hover:bg-white/[0.06] transition-all duration-200 group"
            >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600
          flex items-center justify-center text-xs font-bold text-white shadow-glow-sm ring-2 ring-violet-500/30">
                    {initials}
                </div>
                <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-slate-200 leading-tight">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 capitalize leading-tight flex items-center gap-1">
                        {user?.role === 'admin' && <Shield className="w-2.5 h-2.5 text-violet-400" />}
                        {user?.role}
                    </p>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 top-full mt-2 w-52 glass rounded-xl overflow-hidden z-50 border border-white/[0.08]"
                    >
                        {/* User info — read-only display, no dead profile link */}
                        <div className="px-4 py-3 border-b border-white/[0.06]">
                            <p className="text-sm font-medium text-slate-100">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-medium
                px-1.5 py-0.5 rounded-md bg-violet-500/15 text-violet-300 capitalize">
                                {user?.role === 'admin' && <Shield className="w-2.5 h-2.5" />}
                                {user?.role}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="p-1.5">
                            <button
                                onClick={handleLogout}
                                disabled={signingOut}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-rose-400
                  hover:bg-rose-500/10 hover:text-rose-300 transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {signingOut
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing out...</>
                                    : <><LogOut className="w-4 h-4" /> Sign out</>
                                }
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
