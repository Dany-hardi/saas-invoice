'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { TrendingUp, Clock, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { InvoiceTable } from '@/components/dashboard/InvoiceTable';
import { useInvoice } from '@/hooks/useInvoice';
import { Invoice } from '@/types/invoice';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
    const { fetchInvoices } = useInvoice();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvoices().then(data => {
            setInvoices(data);
            setLoading(false);
        });
    }, [fetchInvoices]);

    const totalRevenue = invoices
        .filter(i => i.status === 'paid')
        .reduce((s, i) => s + i.total_cents, 0);

    const pendingCount = invoices.filter(i => i.status === 'pending').length;
    const overdueCount = invoices.filter(i => i.status === 'overdue').length;
    const paidCount = invoices.filter(i => i.status === 'paid').length;

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        border: '2px solid var(--color-border)',
                        borderTopColor: 'var(--color-accent)',
                    }}
                />
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
            {/* Top bar */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-8"
            >
                <div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
                        Dashboard
                    </h1>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
                        Your financial command center
                    </p>
                </div>
                <Link href="/dashboard/invoices/new">
                    <motion.button
                        whileTap={{ scale: 0.96 }}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={15} />
                        New Invoice
                    </motion.button>
                </Link>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <StatsCard
                    label="Total Revenue"
                    value={formatCurrency(totalRevenue)}
                    sub={`${paidCount} paid invoices`}
                    icon={TrendingUp}
                    accentColor="var(--color-accent)"
                    index={0}
                />
                <StatsCard
                    label="Pending"
                    value={String(pendingCount)}
                    sub="Awaiting payment"
                    icon={Clock}
                    accentColor="var(--color-warning)"
                    index={1}
                />
                <StatsCard
                    label="Overdue"
                    value={String(overdueCount)}
                    sub="Action required"
                    icon={AlertCircle}
                    accentColor="var(--color-danger)"
                    index={2}
                />
                <StatsCard
                    label="Paid"
                    value={String(paidCount)}
                    sub="Completed"
                    icon={CheckCircle}
                    accentColor="var(--color-success)"
                    index={3}
                />
            </div>

            {/* Revenue Chart */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="mb-6"
            >
                <RevenueChart invoices={invoices} />
            </motion.div>

            {/* Invoice Table */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
            >
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold tracking-widest uppercase"
                        style={{ color: 'var(--color-subtle)' }}>
                        Recent Invoices
                    </p>
                    <Link
                        href="/dashboard/invoices"
                        className="text-xs"
                        style={{ color: 'var(--color-accent-2)' }}
                    >
                        View all →
                    </Link>
                </div>
                <InvoiceTable invoices={invoices.slice(0, 8)} />
            </motion.div>
        </div>
    );
}
