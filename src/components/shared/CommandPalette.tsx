'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { Search, FileText, Plus, Settings, LayoutDashboard } from 'lucide-react';
import { useSound } from './SoundProvider';

export function CommandPalette() {
    const [open, setOpen] = useState(false);
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

    const runCommand = (command: () => void) => {
        playClick();
        setOpen(false);
        command();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden">
                <Command className="w-full" label="Global Command Menu">
                    <div className="flex items-center px-4 border-b border-[var(--color-border)]">
                        <Search size={18} className="text-[var(--color-muted)] mr-2" />
                        <Command.Input
                            autoFocus
                            placeholder="Type a command or search..."
                            className="w-full bg-transparent border-none outline-none py-4 text-[var(--color-text)] text-sm placeholder:text-[var(--color-subtle)]"
                        />
                    </div>

                    <Command.List className="max-h-[300px] overflow-y-auto p-2">
                        <Command.Empty className="py-6 text-center text-sm text-[var(--color-muted)]">
                            No results found.
                        </Command.Empty>

                        <Command.Group heading="Navigation" className="text-xs font-medium text-[var(--color-subtle)] px-2 py-1.5">
                            <Command.Item
                                onSelect={() => runCommand(() => router.push('/dashboard'))}
                                className="flex items-center gap-2 px-2 py-2.5 text-sm text-[var(--color-text)] rounded-md cursor-pointer hover:bg-[var(--color-surface-2)] aria-selected:bg-[var(--color-surface-2)]"
                            >
                                <LayoutDashboard size={16} className="text-[var(--color-muted)]" />
                                Dashboard
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => router.push('/dashboard/invoices'))}
                                className="flex items-center gap-2 px-2 py-2.5 text-sm text-[var(--color-text)] rounded-md cursor-pointer hover:bg-[var(--color-surface-2)] aria-selected:bg-[var(--color-surface-2)]"
                            >
                                <FileText size={16} className="text-[var(--color-muted)]" />
                                Invoices
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => router.push('/dashboard/settings'))}
                                className="flex items-center gap-2 px-2 py-2.5 text-sm text-[var(--color-text)] rounded-md cursor-pointer hover:bg-[var(--color-surface-2)] aria-selected:bg-[var(--color-surface-2)]"
                            >
                                <Settings size={16} className="text-[var(--color-muted)]" />
                                Settings
                            </Command.Item>
                        </Command.Group>

                        <Command.Group heading="Actions" className="text-xs font-medium text-[var(--color-subtle)] px-2 py-1.5 mt-2">
                            <Command.Item
                                onSelect={() => runCommand(() => router.push('/dashboard/invoices/new'))}
                                className="flex items-center gap-2 px-2 py-2.5 text-sm text-[var(--color-text)] rounded-md cursor-pointer hover:bg-[var(--color-surface-2)] aria-selected:bg-[var(--color-surface-2)]"
                            >
                                <Plus size={16} className="text-[var(--color-muted)]" />
                                Create New Invoice
                            </Command.Item>
                        </Command.Group>
                    </Command.List>
                </Command>
            </div>
        </div>
    );
}
