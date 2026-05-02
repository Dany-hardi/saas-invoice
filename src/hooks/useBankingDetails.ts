'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BankingDetails } from '@/types/invoice';

export function useBankingDetails() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const fetchBankingDetails = useCallback(async (): Promise<BankingDetails | null> => {
        setLoading(true);
        setError(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from('banking_details')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data as BankingDetails | null;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch banking details');
            return null;
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    const saveBankingDetails = useCallback(
        async (details: Partial<BankingDetails>): Promise<boolean> => {
            setLoading(true);
            setError(null);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('Not authenticated');

                const { error } = await supabase
                    .from('banking_details')
                    .upsert({ ...details, user_id: user.id, updated_at: new Date().toISOString() });

                if (error) throw error;
                return true;
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to save banking details');
                return false;
            } finally {
                setLoading(false);
            }
        },
        [supabase]
    );

    return { loading, error, fetchBankingDetails, saveBankingDetails };
}
