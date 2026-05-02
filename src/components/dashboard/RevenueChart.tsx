'use client';

import { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Invoice } from '@/types/invoice';
import { formatCurrency } from '@/lib/utils';

interface RevenueChartProps {
    invoices: Invoice[];
}

export function RevenueChart({ invoices }: RevenueChartProps) {
    const data = useMemo(() => {
        const monthMap = new Map<string, number>();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        invoices
            .filter(inv => inv.status === 'paid')
            .forEach(inv => {
                const d = new Date(inv.issue_date);
                const key = months[d.getMonth()];
                monthMap.set(key, (monthMap.get(key) ?? 0) + inv.total_cents / 100);
            });

        return months.map(month => ({
            month,
            revenue: monthMap.get(month) ?? 0,
        }));
    }, [invoices]);


    return (
        <div className="card" style={{ height: 220 }}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4"
                style={{ color: 'var(--color-subtle)' }}>
                Revenue — 2026
            </p>
            <ResponsiveContainer width="100%" height="80%">
                <LineChart data={data} margin={{ top: 0, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis
                        dataKey="month"
                        tick={{ fill: 'var(--color-subtle)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: 'var(--color-subtle)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={v => `€${v}`}
                    />
                    <Tooltip formatter={(value) => formatCurrency(Number(value) * 100)} />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--color-accent)"
                        strokeWidth={2}
                        dot={{ fill: 'var(--color-accent)', r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: 'var(--color-accent-2)', strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
