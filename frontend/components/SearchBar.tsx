'use client';

import { Search, X } from 'lucide-react';
import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = 'Search tasks...' }: SearchBarProps) {
    const ref = useRef<HTMLInputElement>(null);

    return (
        <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
                ref={ref}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="input pl-10 pr-9 w-64"
            />
            <AnimatePresence>
                {value && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => { onChange(''); ref.current?.focus(); }}
                        className="absolute right-3 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
