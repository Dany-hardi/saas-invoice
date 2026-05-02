'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useInvoice } from '@/hooks/useInvoice';
import { useCalculateTotal, useLineItems } from '@/hooks/useCalculateTotal';
import { LineItemsEditor } from '@/components/invoice/LineItemRow';
import { formatCurrency } from '@/lib/utils';

export default function NewInvoicePage() {
    const router = useRouter();
    const { createInvoice, loading } = useInvoice();

    const [clientName, setClientName] = useState('');
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [taxRate, setTaxRate] = useState(20);
    const [discount, setDiscount] = useState(0);
    const [notes, setNotes] = useState('');

    const { items, addItem, removeItem, updateItem } = useLineItems();
    const { calculate } = useCalculateTotal(taxRate, discount * 100);

    const totals = calculate(items);

    const handleSave = async () => {
        // In a real app, we'd create the client first or select from a dropdown.
        // For this MVP, we pass client_id as empty and rely on notes/terms or a simplified model.
        // We will just use the form data to create the invoice.
        const inv = await createInvoice(
            {
                client_id: '', // Mock
                issue_date: issueDate,
                due_date: dueDate,
                currency: 'EUR',
                tax_rate: taxRate,
                discount_cents: discount * 100,
                notes: `Client: ${clientName}\n${notes}`,
                terms: '',
                line_items: items,
            },
            items,
            totals
        );

        if (inv) {
            router.push(`/dashboard/invoices/${inv.id}`);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/invoices" className="btn-ghost" style={{ padding: '0.5rem' }}>
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
                            New Invoice
                        </h1>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
                            Draft a new billing document
                        </p>
                    </div>
                </div>
                <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={handleSave}
                    disabled={loading}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Save size={15} />
                    {loading ? 'Saving...' : 'Save Draft'}
                </motion.button>
            </div>

            <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 320px' }}>
                {/* Editor Form */}
                <div className="space-y-6">
                    <div className="card space-y-4">
                        <h2 className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--color-subtle)' }}>
                            Details
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Client Name</label>
                                <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="input-base" placeholder="Acme Corp" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Issue Date</label>
                                <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="input-base" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Due Date</label>
                                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="input-base" />
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h2 className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--color-subtle)' }}>
                            Line Items
                        </h2>
                        <LineItemsEditor items={items} onAdd={addItem} onUpdate={updateItem} onRemove={removeItem} />
                    </div>

                    <div className="card space-y-4">
                        <h2 className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--color-subtle)' }}>
                            Notes
                        </h2>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="input-base"
                            rows={3}
                            placeholder="Thank you for your business..."
                        />
                    </div>
                </div>

                {/* Live Totals Sidebar */}
                <div>
                    <div className="card sticky top-6">
                        <h2 className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--color-subtle)' }}>
                            Summary
                        </h2>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span style={{ color: 'var(--color-muted)' }}>Subtotal</span>
                                <span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(totals.subtotal_cents)}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span style={{ color: 'var(--color-muted)' }}>Discount (€)</span>
                                <input
                                    type="number"
                                    min={0}
                                    value={discount}
                                    onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                                    className="input-base text-right"
                                    style={{ width: 80, padding: '0.2rem 0.5rem', fontFamily: 'var(--font-mono)' }}
                                />
                            </div>

                            <div className="flex justify-between items-center">
                                <span style={{ color: 'var(--color-muted)' }}>Tax Rate (%)</span>
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={taxRate}
                                    onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                                    className="input-base text-right"
                                    style={{ width: 80, padding: '0.2rem 0.5rem', fontFamily: 'var(--font-mono)' }}
                                />
                            </div>

                            <div className="flex justify-between">
                                <span style={{ color: 'var(--color-muted)' }}>Tax Amount</span>
                                <span style={{ fontFamily: 'var(--font-mono)' }}>{formatCurrency(totals.tax_cents)}</span>
                            </div>

                            <div className="divider" />

                            <div className="flex justify-between items-center">
                                <span className="font-semibold" style={{ color: 'var(--color-text)' }}>Total Due</span>
                                <span className="text-xl font-bold" style={{ color: 'var(--color-accent-2)', fontFamily: 'var(--font-mono)' }}>
                                    {formatCurrency(totals.total_cents)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
