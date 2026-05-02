'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, UploadCloud } from 'lucide-react';
import { useBankingDetails } from '@/hooks/useBankingDetails';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
    const { fetchBankingDetails, saveBankingDetails, loading: bankingLoading } = useBankingDetails();
    const [bankName, setBankName] = useState('');
    const [iban, setIban] = useState('');
    const [swift, setSwift] = useState('');
    const [stripe, setStripe] = useState('');
    const [paypal, setPaypal] = useState('');

    const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        fetchBankingDetails().then(data => {
            if (data) {
                setBankName(data.bank_name || '');
                setIban(data.iban || '');
                setSwift(data.swift_bic || '');
                setStripe(data.stripe_link || '');
                setPaypal(data.paypal_link || '');
            }
        });

        // Fetch profile for signature
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                supabase.from('profiles').select('signature_url').eq('id', user.id).single().then(({ data }) => {
                    if (data?.signature_url) setSignatureUrl(data.signature_url);
                });
            }
        });
    }, [fetchBankingDetails, supabase]);

    const handleSaveBanking = async () => {
        await saveBankingDetails({
            bank_name: bankName,
            iban,
            swift_bic: swift,
            stripe_link: stripe,
            paypal_link: paypal,
        });
        alert('Banking details saved successfully.');
    };

    const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/signature-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('signatures')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('signatures')
                .getPublicUrl(filePath);

            await supabase
                .from('profiles')
                .update({ signature_url: publicUrl })
                .eq('id', user.id);

            setSignatureUrl(publicUrl);
        } catch (err) {
            console.error('Upload error:', err);
            alert('Failed to upload signature.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
                    Settings
                </h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
                    Manage your banking details and signature
                </p>
            </motion.div>

            <div className="space-y-6">
                {/* Banking Vault */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-semibold tracking-widest uppercase" style={{ color: 'var(--color-subtle)' }}>
                            Banking Vault
                        </h2>
                        <button
                            onClick={handleSaveBanking}
                            disabled={bankingLoading}
                            className="btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem' }}
                        >
                            <Save size={14} />
                            {bankingLoading ? 'Saving...' : 'Save Details'}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Bank Name</label>
                            <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} className="input-base" placeholder="Revolut Business" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>IBAN</label>
                            <input type="text" value={iban} onChange={e => setIban(e.target.value)} className="input-base font-mono" placeholder="GB00 REVO 0000 0000 0000 00" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>SWIFT / BIC</label>
                            <input type="text" value={swift} onChange={e => setSwift(e.target.value)} className="input-base font-mono" placeholder="REVOGB21" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>Stripe Pay Link</label>
                            <input type="url" value={stripe} onChange={e => setStripe(e.target.value)} className="input-base" placeholder="https://buy.stripe.com/..." />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>PayPal Link</label>
                            <input type="url" value={paypal} onChange={e => setPaypal(e.target.value)} className="input-base" placeholder="https://paypal.me/..." />
                        </div>
                    </div>
                </motion.div>

                {/* Sign & Seal */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card"
                >
                    <h2 className="text-sm font-semibold tracking-widest uppercase mb-6" style={{ color: 'var(--color-subtle)' }}>
                        Sign & Seal
                    </h2>

                    <div className="flex items-start gap-8">
                        <div className="flex-1">
                            <p className="text-sm mb-4" style={{ color: 'var(--color-muted)' }}>
                                Upload a transparent PNG of your signature. This will be embedded securely into all generated PDF invoices.
                            </p>

                            <label className="btn-ghost inline-flex items-center gap-2 cursor-pointer">
                                <UploadCloud size={16} />
                                {uploading ? 'Uploading...' : 'Upload Signature'}
                                <input type="file" accept="image/png" className="hidden" onChange={handleSignatureUpload} disabled={uploading} />
                            </label>
                        </div>

                        <div
                            className="w-48 h-24 rounded-lg flex items-center justify-center relative overflow-hidden"
                            style={{ background: 'var(--color-surface-2)', border: '1px dashed var(--color-border)' }}
                        >
                            {signatureUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={signatureUrl} alt="Signature" className="max-w-full max-h-full object-contain p-2" />
                            ) : (
                                <span className="text-xs" style={{ color: 'var(--color-subtle)' }}>No signature</span>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
