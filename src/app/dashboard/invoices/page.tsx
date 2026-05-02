'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { InvoiceTable } from '@/components/dashboard/InvoiceTable';
import { useInvoice } from '@/hooks/useInvoice';
import { Invoice } from '@/types/invoice';

export default function InvoicesPage() {
    const { fetchInvoices } = useInvoice();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvoices().then(data => {
            setInvoices(data);
            setLoading(false);
        });
    }, [fetchInvoices]);

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
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-8"
            >
                <div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
                        Invoices
                    </h1>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
                        Manage all your billing history
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

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
            >
                <InvoiceTable invoices={invoices} />
            </motion.div>
        </div>
    );
}
