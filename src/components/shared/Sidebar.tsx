'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    FileText,
    Settings,
    Zap,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/invoices', label: 'Invoices', icon: FileText },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="p-6 pb-4">
                <Link href="/dashboard" className="flex items-center gap-2.5 group">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, #6366F1, #818CF8)',
                            boxShadow: '0 0 20px rgba(99,102,241,0.4)',
                        }}
                    >
                        <Zap size={15} className="text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold tracking-tight" style={{ color: 'var(--color-text)' }}>
                            InvoiceOS
                        </p>
                        <p className="text-xs" style={{ color: 'var(--color-subtle)' }}>
                            Freelance Suite
                        </p>
                    </div>
                </Link>
            </div>

            <div className="divider mx-4" />

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-0.5">
                {navItems.map((item, i) => {
                    const isActive =
                        item.href === '/dashboard'
                            ? pathname === '/dashboard'
                            : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <motion.div
                            key={item.href}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.07, duration: 0.3 }}
                        >
                            <Link
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative',
                                    isActive
                                        ? 'text-white'
                                        : 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute inset-0 rounded-lg"
                                        style={{
                                            background:
                                                'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(129,140,248,0.1))',
                                            border: '1px solid rgba(99,102,241,0.3)',
                                        }}
                                        transition={{ type: 'spring', duration: 0.4 }}
                                    />
                                )}
                                <Icon
                                    size={15}
                                    className={cn(
                                        'relative z-10 transition-colors',
                                        isActive ? 'text-[var(--color-accent-2)]' : ''
                                    )}
                                />
                                <span className="relative z-10">{item.label}</span>
                                {isActive && (
                                    <ChevronRight
                                        size={12}
                                        className="ml-auto relative z-10 text-[var(--color-accent-2)]"
                                    />
                                )}
                            </Link>
                        </motion.div>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 mt-auto">
                <div
                    className="rounded-lg p-3"
                    style={{
                        background: 'var(--color-surface-2)',
                        border: '1px solid var(--color-border)',
                    }}
                >
                    <p className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
                        Current Year
                    </p>
                    <p
                        className="text-lg font-bold tracking-tight mt-0.5"
                        style={{ color: 'var(--color-accent-2)', fontFamily: 'var(--font-mono)' }}
                    >
                        2026
                    </p>
                </div>
            </div>
        </aside>
    );
}
