'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Trash2, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useInvoice } from '@/hooks/useInvoice';
import { Invoice } from '@/types/invoice';
import { InvoiceStatusBadge } from '@/components/invoice/InvoiceStatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { fetchInvoiceById, updateInvoiceStatus, deleteInvoice } = useInvoice();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvoiceById(id).then(data => {
            setInvoice(data);
            setLoading(false);
        });
    }, [id, fetchInvoiceById]);

    const handleStatusChange = async (status: Invoice['status']) => {
        if (!invoice) return;
        const success = await updateInvoiceStatus(invoice.id, status);
        if (success) {
            setInvoice({ ...invoice, status });
        }
    };

    const handleDelete = async () => {
        if (!invoice) return;
        if (confirm('Are you sure you want to delete this invoice?')) {
            const success = await deleteInvoice(invoice.id);
            if (success) {
                router.push('/dashboard/invoices');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="w-6 h-6 border-2 border-[var(--color-border)] border-t-[var(--color-accent)] rounded-full animate-spin" />
            </div>
        );
    }

    if (!invoice) {
        return <div className="p-8 text-center text-[var(--color-muted)]">Invoice not found.</div>;
    }

    return (
        <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/invoices" className="btn-ghost" style={{ padding: '0.5rem' }}>
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}>
                                {invoice.matricule}
                            </h1>
                            <InvoiceStatusBadge status={invoice.status} />
                        </div>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
                            Issued {formatDate(invoice.issue_date)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <a
                        href={`/api/pdf/${invoice.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Download size={15} />
                        Download PDF
                    </a>
                </div>
            </div>

            <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 280px' }}>
                <div className="space-y-6">
                    <div className="card">
                        <h2 className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--color-subtle)' }}>
                            Line Items
                        </h2>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th className="text-right">Qty</th>
                                    <th className="text-right">Rate</th>
                                    <th className="text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.line_items?.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.description}</td>
                                        <td className="text-right font-mono">{item.quantity}</td>
                                        <td className="text-right font-mono">{formatCurrency(item.unit_price_cents, invoice.currency)}</td>
                                        <td className="text-right font-mono font-semibold text-[var(--color-text)]">
                                            {formatCurrency(item.amount_cents, invoice.currency)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="mt-6 flex justify-end">
                            <div className="w-64 space-y-2 text-sm">
                                <div className="flex justify-between text-[var(--color-muted)]">
                                    <span>Subtotal</span>
                                    <span className="font-mono">{formatCurrency(invoice.subtotal_cents, invoice.currency)}</span>
                                </div>
                                <div className="flex justify-between text-[var(--color-muted)]">
                                    <span>Tax ({invoice.tax_rate}%)</span>
                                    <span className="font-mono">{formatCurrency(invoice.tax_cents, invoice.currency)}</span>
                                </div>
                                <div className="divider my-2" />
                                <div className="flex justify-between font-bold text-[var(--color-text)]">
                                    <span>Total</span>
                                    <span className="font-mono text-[var(--color-accent-2)] text-lg">
                                        {formatCurrency(invoice.total_cents, invoice.currency)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {invoice.notes && (
                        <div className="card">
                            <h2 className="text-sm font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--color-subtle)' }}>
                                Notes
                            </h2>
                            <p className="text-sm text-[var(--color-muted)] whitespace-pre-wrap">{invoice.notes}</p>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="card">
                        <h2 className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--color-subtle)' }}>
                            Actions
                        </h2>
                        <div className="space-y-2">
                            {invoice.status !== 'paid' && (
                                <button
                                    onClick={() => handleStatusChange('paid')}
                                    className="btn-ghost w-full justify-start"
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)', borderColor: 'rgba(34,197,94,0.2)' }}
                                >
                                    <CheckCircle size={14} />
                                    Mark as Paid
                                </button>
                            )}
                            {invoice.status !== 'pending' && (
                                <button
                                    onClick={() => handleStatusChange('pending')}
                                    className="btn-ghost w-full justify-start"
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-warning)', borderColor: 'rgba(245,158,11,0.2)' }}
                                >
                                    <Clock size={14} />
                                    Mark as Pending
                                </button>
                            )}
                            <div className="divider" />
                            <button
                                onClick={handleDelete}
                                className="btn-ghost w-full justify-start"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-danger)', borderColor: 'rgba(239,68,68,0.2)' }}
                            >
                                <Trash2 size={14} />
                                Delete Invoice
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
