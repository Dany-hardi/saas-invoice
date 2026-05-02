import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const ZERO_DECIMAL_CURRENCIES = new Set(['XAF']);

/**
 * Format cents to a currency string
 */
export function formatCurrency(cents: number, currency = 'EUR'): string {
    const useMinorUnits = !ZERO_DECIMAL_CURRENCIES.has(currency);

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: useMinorUnits ? 2 : 0,
        maximumFractionDigits: useMinorUnits ? 2 : 0,
    }).format(useMinorUnits ? cents / 100 : cents);
}

/**
 * Format a date string to a human-readable format
 */
export function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(dateStr));
}

/**
 * Calculate days until/past due date
 */
export function getDaysOverdue(dueDateStr: string | null): number {
    if (!dueDateStr) return 0;
    const due = new Date(dueDateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
}

/**
 * Generate a stable local UUID for draft line items
 */
export function generateLocalId(): string {
    return `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
