'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { LineItemDraft } from '@/types/invoice';
import { formatCurrency } from '@/lib/utils';

interface LineItemRowProps {
    item: LineItemDraft;
    onUpdate: <K extends keyof LineItemDraft>(id: string, field: K, value: LineItemDraft[K]) => void;
    onRemove: (id: string) => void;
    canRemove: boolean;
}

export function LineItemRow({ item, onUpdate, onRemove, canRemove }: LineItemRowProps) {
    const amount = Math.round(item.quantity * item.unit_price_cents);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="grid gap-2 items-center"
            style={{ gridTemplateColumns: '1fr 80px 110px 90px 32px' }}
        >
            {/* Description */}
            <input
                type="text"
                placeholder="Service description…"
                value={item.description}
                onChange={e => onUpdate(item.id, 'description', e.target.value)}
                className="input-base"
            />

            {/* Quantity */}
            <input
                type="number"
                min={0}
                step={0.5}
                placeholder="Qty"
                value={item.quantity}
                onChange={e => onUpdate(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                className="input-base text-right"
                style={{ fontFamily: 'var(--font-mono)' }}
            />

            {/* Unit Price */}
            <input
                type="number"
                min={0}
                placeholder="Rate (€)"
                value={item.unit_price_cents / 100}
                onChange={e =>
                    onUpdate(item.id, 'unit_price_cents', Math.round((parseFloat(e.target.value) || 0) * 100))
                }
                className="input-base text-right"
                style={{ fontFamily: 'var(--font-mono)' }}
            />

            {/* Amount (computed) */}
            <div
                className="text-right text-sm font-semibold"
                style={{ color: 'var(--color-text)', fontFamily: 'var(--font-mono)' }}
            >
                {formatCurrency(amount)}
            </div>

            {/* Remove */}
            {canRemove ? (
                <button
                    onClick={() => onRemove(item.id)}
                    className="flex items-center justify-center rounded-lg transition-colors"
                    style={{
                        width: 28,
                        height: 28,
                        background: 'rgba(239,68,68,0.1)',
                        color: 'var(--color-danger)',
                        border: '1px solid rgba(239,68,68,0.2)',
                    }}
                >
                    <Trash2 size={12} />
                </button>
            ) : (
                <div style={{ width: 28 }} />
            )}
        </motion.div>
    );
}

interface LineItemsEditorProps {
    items: LineItemDraft[];
    onAdd: () => void;
    onUpdate: <K extends keyof LineItemDraft>(id: string, field: K, value: LineItemDraft[K]) => void;
    onRemove: (id: string) => void;
}

export function LineItemsEditor({ items, onAdd, onUpdate, onRemove }: LineItemsEditorProps) {
    return (
        <div className="space-y-2">
            {/* Header row */}
            <div
                className="grid gap-2 text-xs font-semibold tracking-widest uppercase"
                style={{
                    gridTemplateColumns: '1fr 80px 110px 90px 32px',
                    color: 'var(--color-subtle)',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid var(--color-border)',
                }}
            >
                <span>Description</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Rate</span>
                <span className="text-right">Amount</span>
                <span />
            </div>

            <AnimatePresence>
                {items.map(item => (
                    <LineItemRow
                        key={item.id}
                        item={item}
                        onUpdate={onUpdate}
                        onRemove={onRemove}
                        canRemove={items.length > 1}
                    />
                ))}
            </AnimatePresence>

            <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onAdd}
                className="btn-ghost w-full mt-2"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
            >
                <Plus size={14} />
                Add Line Item
            </motion.button>
        </div>
    );
}
