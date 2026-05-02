'use client';

import { InvoiceStatus } from '@/types/invoice';
import { cn } from '@/lib/utils';

interface InvoiceStatusBadgeProps {
    status: InvoiceStatus;
    className?: string;
}

const statusConfig: Record<
    InvoiceStatus,
    { label: string; dot: string; bg: string; text: string; border: string }
> = {
    draft: {
        label: 'Draft',
        dot: 'bg-zinc-400',
        bg: 'rgba(39,39,42,0.8)',
        text: '#A1A1AA',
        border: 'rgba(63,63,70,0.5)',
    },
    pending: {
        label: 'Pending',
        dot: 'bg-amber-400',
        bg: 'rgba(245,158,11,0.1)',
        text: '#FCD34D',
        border: 'rgba(245,158,11,0.25)',
    },
    paid: {
        label: 'Paid',
        dot: 'bg-emerald-400',
        bg: 'rgba(34,197,94,0.1)',
        text: '#4ADE80',
        border: 'rgba(34,197,94,0.25)',
    },
    overdue: {
        label: 'Overdue',
        dot: 'bg-red-400',
        bg: 'rgba(239,68,68,0.1)',
        text: '#F87171',
        border: 'rgba(239,68,68,0.25)',
    },
    cancelled: {
        label: 'Cancelled',
        dot: 'bg-zinc-500',
        bg: 'rgba(39,39,42,0.6)',
        text: '#71717A',
        border: 'rgba(63,63,70,0.3)',
    },
};

export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <span
            className={cn('badge', className)}
            style={{
                background: config.bg,
                color: config.text,
                border: `1px solid ${config.border}`,
            }}
        >
            <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
            {config.label}
        </span>
    );
}
