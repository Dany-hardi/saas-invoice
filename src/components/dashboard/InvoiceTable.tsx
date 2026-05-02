'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Invoice } from '@/types/invoice';
import { InvoiceStatusBadge } from '@/components/invoice/InvoiceStatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

interface InvoiceTableProps {
    invoices: Invoice[];
}

export function InvoiceTable({ invoices }: InvoiceTableProps) {
    if (invoices.length === 0) {
        return (
            <div
                className="card flex flex-col items-center justify-center py-16"
                style={{ borderStyle: 'dashed' }}
            >
                <p className="text-sm" style={{ color: 'var(--color-subtle)' }}>
                    No invoices yet.{' '}
                    <Link
                        href="/dashboard/invoices/new"
                        style={{ color: 'var(--color-accent-2)' }}
                        className="underline underline-offset-2"
                    >
                        Create your first one →
                    </Link>
                </p>
            </div>
        );
    }

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Matricule</th>
                        <th>Client</th>
                        <th>Issued</th>
                        <th>Due</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <AnimatePresence>
                        {invoices.map((invoice, i) => (
                            <motion.tr
                                key={invoice.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: i * 0.04, duration: 0.3 }}
                            >
                                <td>
                                    <span
                                        style={{
                                            fontFamily: 'var(--font-mono)',
                                            color: 'var(--color-accent-2)',
                                            fontSize: '0.8rem',
                                        }}
                                    >
                                        {invoice.matricule}
                                    </span>
                                </td>
                                <td>
                                    <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>
                                        {invoice.clients?.name ?? '—'}
                                    </span>
                                </td>
                                <td>{formatDate(invoice.issue_date)}</td>
                                <td
                                    style={{
                                        color:
                                            invoice.status === 'overdue' ? 'var(--color-danger)' : 'var(--color-muted)',
                                    }}
                                >
                                    {formatDate(invoice.due_date)}
                                </td>
                                <td>
                                    <span
                                        style={{
                                            color: 'var(--color-text)',
                                            fontFamily: 'var(--font-mono)',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {formatCurrency(invoice.total_cents, invoice.currency)}
                                    </span>
                                </td>
                                <td>
                                    <InvoiceStatusBadge status={invoice.status} />
                                </td>
                                <td>
                                    <Link
                                        href={`/dashboard/invoices/${invoice.id}`}
                                        className="btn-ghost"
                                        style={{ padding: '0.3rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}
                                    >
                                        View <ExternalLink size={11} />
                                    </Link>
                                </td>
                            </motion.tr>
                        ))}
                    </AnimatePresence>
                </tbody>
            </table>
        </div>
    );
}
