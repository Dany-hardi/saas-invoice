'use client';

import { useEffect, useMemo, useState } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { Search, FileText, Plus, Settings, LayoutDashboard } from 'lucide-react';
import { useSound } from './SoundProvider';
import { createClient } from '@/lib/supabase/client';
import { Invoice } from '@/types/invoice';

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const router = useRouter();
    const { playPop, playClick } = useSound();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => {
                    if (!open) playPop();
                    return !open;
                });
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [playPop]);

    useEffect(() => {
        if (!open) return;
        const supabase = createClient();
        supabase
            .from('invoices')
            .select('id, matricule, total_cents, currency, issue_date, user_id, client_id, prefix, status, subtotal_cents, tax_rate, tax_cents, discount_cents, notes, terms, signature_url, auth_hash, created_at, updated_at')
            .order('created_at', { ascending: false })
            .limit(8)
            .then(({ data }) => setInvoices((data as Invoice[]) || []));
    }, [open]);

    const runCommand = (command: () => void) => {
        playClick();
        setOpen(false);
        command();
    };

    const recentInvoices = useMemo(() => invoices.filter((item) => item.matricule), [invoices]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden">
                <Command className="w-full" label="Global Command Menu">
                    <div className="flex items-center px-4 border-b border-[var(--color-border)]">
                        <Search size={18} className="text-[var(--color-muted)] mr-2" />
                        <Command.Input autoFocus placeholder="Type a command or search by matricule..." className="w-full bg-transparent border-none outline-none py-4 text-[var(--color-text)] text-sm" />
                    </div>
                    <Command.List className="max-h-[320px] overflow-y-auto p-2">
                        <Command.Group heading="Navigation">
                            <Command.Item onSelect={() => runCommand(() => router.push('/dashboard'))}><LayoutDashboard size={16} />Dashboard</Command.Item>
                            <Command.Item onSelect={() => runCommand(() => router.push('/dashboard/invoices'))}><FileText size={16} />Invoices</Command.Item>
                            <Command.Item onSelect={() => runCommand(() => router.push('/dashboard/settings'))}><Settings size={16} />Settings</Command.Item>
                            <Command.Item onSelect={() => runCommand(() => router.push('/dashboard/invoices/new'))}><Plus size={16} />Create New Invoice</Command.Item>
                        </Command.Group>
                        <Command.Group heading="Recent Invoices">
                            {recentInvoices.map((invoice) => (
                                <Command.Item key={invoice.id} value={`${invoice.matricule}`} onSelect={() => runCommand(() => router.push(`/dashboard/invoices/${invoice.id}`))}>
                                    <FileText size={16} />{invoice.matricule}
                                </Command.Item>
                            ))}
                        </Command.Group>
                    </Command.List>
                </Command>
            </div>
        </div>
    );
}
