'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Zap, Mail } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const supabase = createClient();

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/dashboard`,
            },
        });

        if (error) {
            setError(error.message);
        } else {
            setSuccess(true);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background blobs */}
            <div
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"
                style={{ transform: 'translate(-50%, -50%)' }}
            />
            <div
                className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"
                style={{ transform: 'translate(50%, 50%)' }}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="card w-full max-w-md relative z-10"
                style={{ padding: '2.5rem' }}
            >
                <div className="flex flex-col items-center mb-8">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                        style={{
                            background: 'linear-gradient(135deg, #6366F1, #818CF8)',
                            boxShadow: '0 0 30px rgba(99,102,241,0.5)',
                        }}
                    >
                        <Zap size={24} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">InvoiceOS</h1>
                    <p className="text-sm mt-1 text-center" style={{ color: 'var(--color-subtle)' }}>
                        Secure Passwordless Login
                    </p>
                </div>

                {success ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-4"
                    >
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                            <Mail className="text-emerald-500" size={20} />
                        </div>
                        <h3 className="text-lg font-semibold text-[var(--color-text)]">Check your email</h3>
                        <p className="text-sm text-[var(--color-muted)]">
                            We sent a magic link to <strong className="text-[var(--color-text)]">{email}</strong>. Click it to sign in instantly.
                        </p>
                        <button
                            onClick={() => setSuccess(false)}
                            className="btn-ghost text-xs mt-4"
                        >
                            Try another email
                        </button>
                    </motion.div>
                ) : (
                    <form onSubmit={handleMagicLink} className="space-y-4">
                        {error && (
                            <div
                                className="p-3 rounded-lg text-sm"
                                style={{
                                    background: 'rgba(239,68,68,0.1)',
                                    color: 'var(--color-danger)',
                                    border: '1px solid rgba(239,68,68,0.2)',
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="input-base"
                                placeholder="commander@example.com"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {loading ? 'Sending...' : 'Send Magic Link'}
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
