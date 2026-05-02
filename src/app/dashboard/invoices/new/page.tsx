'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useInvoice } from '@/hooks/useInvoice';
import { useCalculateTotal } from '@/hooks/useCalculateTotal';
import { formatCurrency } from '@/lib/utils';

const currencies = ['EUR', 'USD', 'GBP', 'XAF'] as const;

const lineItemSchema = z.object({
    description: z.string().trim().min(1, 'Description is required'),
    quantity: z.coerce.number().min(0.01, 'Quantity must be greater than 0'),
    unitPrice: z.coerce.number().min(0, 'Rate cannot be negative'),
});

const invoiceSchema = z.object({
    clientName: z.string().trim().min(1, 'Client name is required'),
    issueDate: z.string().min(1, 'Issue date is required'),
    dueDate: z.string().optional(),
    currency: z.enum(currencies),
    taxRate: z.coerce.number().min(0).max(100),
    discount: z.coerce.number().min(0),
    notes: z.string().optional(),
    lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
});

type InvoiceFormValues = z.input<typeof invoiceSchema>;
type InvoiceFormOutput = z.output<typeof invoiceSchema>;

export default function NewInvoicePage() {
    const router = useRouter();
    const { createInvoice, loading } = useInvoice();

    const {
        control,
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<InvoiceFormValues, unknown, InvoiceFormOutput>({
        resolver: zodResolver(invoiceSchema),
        defaultValues: {
            clientName: '',
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: '',
            currency: 'EUR',
            taxRate: 20,
            discount: 0,
            notes: '',
            lineItems: [{ description: '', quantity: 1, unitPrice: 0 }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'lineItems',
    });

    const watched = watch();

    const lineItemsDraft = useMemo(
        () =>
            (watched.lineItems || []).map((item, index) => ({
                id: `${index}`,
                description: item.description || '',
                quantity: Number(item.quantity) || 0,
                unit_price_cents: Math.round((Number(item.unitPrice) || 0) * 100),
            })),
        [watched.lineItems]
    );

    const { calculate } = useCalculateTotal(Number(watched.taxRate) || 0, Math.round((Number(watched.discount) || 0) * 100));
    const totals = calculate(lineItemsDraft);

    const onSubmit = async (values: InvoiceFormOutput) => {
        const inv = await createInvoice(
            {
                client_id: '',
                issue_date: values.issueDate,
                due_date: values.dueDate || '',
                currency: values.currency,
                tax_rate: values.taxRate,
                discount_cents: Math.round(values.discount * 100),
                notes: `Client: ${values.clientName}\n${values.notes || ''}`.trim(),
                terms: '',
                line_items: lineItemsDraft,
            },
            lineItemsDraft,
            totals
        );

        if (inv) {
            router.push(`/dashboard/invoices/${inv.id}`);
        }
    };

    const selectedCurrency = watched.currency || 'EUR';

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/invoices" className="btn-ghost" style={{ padding: '0.5rem' }}>
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
                            New Invoice
                        </h1>
                    </div>
                </div>
                <motion.button whileTap={{ scale: 0.96 }} type="submit" disabled={loading} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Save size={15} />
                    {loading ? 'Saving...' : 'Save Draft'}
                </motion.button>
            </div>

            <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 320px' }}>
                <div className="space-y-6">
                    <div className="card space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium mb-1.5">Client Name</label>
                                <input {...register('clientName')} className="input-base" placeholder="Acme Corp" />
                                {errors.clientName && <p className="text-xs text-red-400 mt-1">{errors.clientName.message}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1.5">Currency</label>
                                <select {...register('currency')} className="input-base">
                                    {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="card space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="grid gap-2 items-center" style={{ gridTemplateColumns: '1fr 80px 110px 90px 32px' }}>
                                <input {...register(`lineItems.${index}.description`)} className="input-base" placeholder="Description" />
                                <input type="number" step="0.5" {...register(`lineItems.${index}.quantity`)} className="input-base text-right" />
                                <input type="number" step="0.01" {...register(`lineItems.${index}.unitPrice`)} className="input-base text-right" />
                                <div className="text-right text-sm font-semibold">{formatCurrency(Math.round((Number(watched.lineItems?.[index]?.quantity) || 0) * ((Number(watched.lineItems?.[index]?.unitPrice) || 0) * 100)), selectedCurrency)}</div>
                                <button type="button" disabled={fields.length === 1} onClick={() => remove(index)}>×</button>
                            </div>
                        ))}
                        <button type="button" className="btn-ghost w-full" onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}>Add Line Item</button>
                        {errors.lineItems && <p className="text-xs text-red-400">{errors.lineItems.message as string}</p>}
                    </div>

                    <div className="card">
                        <textarea {...register('notes')} className="input-base" rows={3} placeholder="Thank you..." />
                    </div>
                </div>

                <div className="card sticky top-6 space-y-3">
                    <input type="number" min={0} {...register('discount')} className="input-base" />
                    <input type="number" min={0} max={100} {...register('taxRate')} className="input-base" />
                    <div>Total: {formatCurrency(totals.total_cents, selectedCurrency)}</div>
                </div>
            </div>
        </form>
    );
}
