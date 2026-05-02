import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';
import QRCode from 'qrcode';
import { createClient } from '@/lib/supabase/server';
import { InvoicePDF } from '@/components/pdf/InvoicePDF';
import { generateQRPayload } from '@/lib/qr';
import { Invoice, BankingDetails, Profile } from '@/types/invoice';

export async function POST(request: NextRequest) {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return NextResponse.json({ error: 'Missing RESEND_API_KEY' }, { status: 500 });

    const { invoiceId } = await request.json();
    if (!invoiceId) return NextResponse.json({ error: 'Missing invoiceId' }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: invoice } = await supabase.from('invoices').select('*, clients(*), line_items(*)').eq('id', invoiceId).eq('user_id', user.id).single();
    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

    const [{ data: profile }, { data: banking }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('banking_details').select('*').eq('user_id', user.id).single(),
    ]);

    const qrDataUrl = await QRCode.toDataURL(generateQRPayload({
        id: invoice.id,
        matricule: invoice.matricule,
        issued: invoice.issue_date,
        total_cents: invoice.total_cents,
        currency: invoice.currency,
    }));

    const pdfBuffer = await renderToBuffer(
        createElement(InvoicePDF, {
            invoice: invoice as Invoice,
            profile: (profile ?? {}) as Profile,
            banking: banking as BankingDetails | null,
            qrDataUrl,
        }) as unknown as Parameters<typeof renderToBuffer>[0]
    );

    const resend = new Resend(resendKey);
    await resend.emails.send({
        from: 'InvoiceOS <onboarding@resend.dev>',
        to: invoice.clients?.email || user.email || '',
        subject: `Invoice ${invoice.matricule}`,
        html: `<div style="font-family:Inter,sans-serif"><h2>Your invoice is ready</h2><p>Please find attached invoice <b>${invoice.matricule}</b>.</p></div>`,
        attachments: [{ filename: `${invoice.matricule}.pdf`, content: Buffer.from(pdfBuffer) }],
    });

    return NextResponse.json({ ok: true });
}
