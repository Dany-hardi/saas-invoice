'use client';

import { useState, useCallback } from 'react';
import { LineItemDraft } from '@/types/invoice';
import { generateLocalId } from '@/lib/utils';

interface TotalsResult {
    subtotal_cents: number;
    tax_cents: number;
    total_cents: number;
}

export function useCalculateTotal(taxRate: number, discountCents: number) {
    const calculate = useCallback(
        (items: LineItemDraft[]): TotalsResult => {
            const subtotal = items.reduce((sum, item) => {
                const amount = Math.round(item.quantity * item.unit_price_cents);
                return sum + amount;
            }, 0);

            const afterDiscount = Math.max(0, subtotal - discountCents);
            const tax = Math.round(afterDiscount * (taxRate / 100));
            const total = afterDiscount + tax;

            return {
                subtotal_cents: subtotal,
                tax_cents: tax,
                total_cents: total,
            };
        },
        [taxRate, discountCents]
    );

    return { calculate };
}

export function useLineItems(initial: LineItemDraft[] = []) {
    const [items, setItems] = useState<LineItemDraft[]>(
        initial.length > 0
            ? initial
            : [{ id: generateLocalId(), description: '', quantity: 1, unit_price_cents: 0 }]
    );

    const addItem = useCallback(() => {
        setItems(prev => [
            ...prev,
            { id: generateLocalId(), description: '', quantity: 1, unit_price_cents: 0 },
        ]);
    }, []);

    const removeItem = useCallback((id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    }, []);

    const updateItem = useCallback(
        <K extends keyof LineItemDraft>(id: string, field: K, value: LineItemDraft[K]) => {
            setItems(prev =>
                prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
            );
        },
        []
    );

    return { items, addItem, removeItem, updateItem, setItems };
}
