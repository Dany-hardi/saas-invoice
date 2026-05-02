'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Invoice, InvoiceFormData, InvoiceStatus, LineItemDraft } from '@/types/invoice';
import { generateQRPayload, extractAuthHash } from '@/lib/qr';

export function useInvoice() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const fetchInvoices = useCallback(async (): Promise<Invoice[]> => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('invoices')
                .select('*, clients(*), line_items(*)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return (data as Invoice[]) ?? [];
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
            return [];
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    const fetchInvoiceById = useCallback(
        async (id: string): Promise<Invoice | null> => {
            setLoading(true);
            setError(null);
            try {
                const { data, error } = await supabase
                    .from('invoices')
                    .select('*, clients(*), line_items(*)')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                return data as Invoice;
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch invoice');
                return null;
            } finally {
                setLoading(false);
            }
        },
        [supabase]
    );

    const createInvoice = useCallback(
        async (
            formData: InvoiceFormData,
            lineItems: LineItemDraft[],
            totals: { subtotal_cents: number; tax_cents: number; total_cents: number }
        ): Promise<Invoice | null> => {
            setLoading(true);
            setError(null);
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser();
                if (!user) throw new Error('Not authenticated');

                // Get user's prefix from profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('invoice_prefix')
                    .eq('id', user.id)
                    .single();

                const prefix = profile?.invoice_prefix ?? 'DEV';

                // Insert invoice — matricule assigned by DB trigger
                const { data: invoice, error: invoiceError } = await supabase
                    .from('invoices')
                    .insert({
                        user_id: user.id,
                        client_id: formData.client_id || null,
                        prefix,
                        status: 'pending',
                        issue_date: formData.issue_date,
                        due_date: formData.due_date || null,
                        currency: formData.currency,
                        subtotal_cents: totals.subtotal_cents,
                        tax_rate: formData.tax_rate,
                        tax_cents: totals.tax_cents,
                        discount_cents: formData.discount_cents,
                        total_cents: totals.total_cents,
                        notes: formData.notes || null,
                        terms: formData.terms || null,
                    })
                    .select()
                    .single();

                if (invoiceError) throw invoiceError;

                // Generate and store auth_hash for QR code
                const authHash = extractAuthHash({
                    id: invoice.id,
                    matricule: invoice.matricule,
                    issued: invoice.issue_date,
                    total_cents: invoice.total_cents,
                });

                await supabase
                    .from('invoices')
                    .update({ auth_hash: authHash })
                    .eq('id', invoice.id);

                // Insert line items
                if (lineItems.length > 0) {
                    const lineItemsToInsert = lineItems.map((item, idx) => ({
                        invoice_id: invoice.id,
                        position: idx,
                        description: item.description,
                        quantity: item.quantity,
                        unit_price_cents: item.unit_price_cents,
                        amount_cents: Math.round(item.quantity * item.unit_price_cents),
                    }));

                    const { error: lineItemsError } = await supabase
                        .from('line_items')
                        .insert(lineItemsToInsert);

                    if (lineItemsError) throw lineItemsError;
                }

                return { ...invoice, auth_hash: authHash } as Invoice;
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to create invoice');
                return null;
            } finally {
                setLoading(false);
            }
        },
        [supabase]
    );

    const updateInvoiceStatus = useCallback(
        async (id: string, status: InvoiceStatus): Promise<boolean> => {
            setLoading(true);
            setError(null);
            try {
                const { error } = await supabase
                    .from('invoices')
                    .update({ status, updated_at: new Date().toISOString() })
                    .eq('id', id);

                if (error) throw error;
                return true;
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to update status');
                return false;
            } finally {
                setLoading(false);
            }
        },
        [supabase]
    );

    const deleteInvoice = useCallback(
        async (id: string): Promise<boolean> => {
            setLoading(true);
            setError(null);
            try {
                const { error } = await supabase.from('invoices').delete().eq('id', id);
                if (error) throw error;
                return true;
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to delete invoice');
                return false;
            } finally {
                setLoading(false);
            }
        },
        [supabase]
    );

    const getQRPayload = useCallback((invoice: Invoice): string => {
        return generateQRPayload({
            id: invoice.id,
            matricule: invoice.matricule,
            issued: invoice.issue_date,
            total_cents: invoice.total_cents,
            currency: invoice.currency,
        });
    }, []);

    return {
        loading,
        error,
        fetchInvoices,
        fetchInvoiceById,
        createInvoice,
        updateInvoiceStatus,
        deleteInvoice,
        getQRPayload,
    };
}
