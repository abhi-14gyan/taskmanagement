'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassCardProps extends HTMLMotionProps<'div'> {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    glow?: boolean;
}

export default function GlassCard({
    children,
    className,
    hover = false,
    glow = false,
    ...props
}: GlassCardProps) {
    return (
        <motion.div
            className={cn(
                'glass',
                hover && 'glass-hover cursor-pointer',
                glow && 'shadow-glow-sm',
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
}
