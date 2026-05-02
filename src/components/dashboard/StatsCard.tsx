'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
    label: string;
    value: string;
    sub?: string;
    icon: LucideIcon;
    accentColor?: string;
    index?: number;
}

export function StatsCard({
    label,
    value,
    sub,
    icon: Icon,
    accentColor = 'var(--color-accent)',
    index = 0,
}: StatsCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="card card-glow relative overflow-hidden"
        >
            {/* Background glow blob */}
            <div
                className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl pointer-events-none"
                style={{ background: accentColor, transform: 'translate(30%, -30%)' }}
            />

            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-semibold tracking-widest uppercase mb-3"
                        style={{ color: 'var(--color-subtle)' }}>
                        {label}
                    </p>
                    <p
                        className="text-3xl font-bold tracking-tight"
                        style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}
                    >
                        {value}
                    </p>
                    {sub && (
                        <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                            {sub}
                        </p>
                    )}
                </div>
                <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                        background: `${accentColor}22`,
                        border: `1px solid ${accentColor}44`,
                    }}
                >
                    <Icon size={17} style={{ color: accentColor }} />
                </div>
            </div>
        </motion.div>
    );
}
