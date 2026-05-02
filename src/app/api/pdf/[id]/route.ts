import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';
import QRCode from 'qrcode';
import { createClient } from '@/lib/supabase/server';
import { InvoicePDF } from '@/components/pdf/InvoicePDF';
import { generateQRPayload } from '@/lib/qr';
import { Invoice, BankingDetails, Profile } from '@/types/invoice';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Fetch invoice with relations
        const { data: invoice, error: invError } = await supabase
            .from('invoices')
            .select('*, clients(*), line_items(*)')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (invError || !invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // Fetch profile & banking details
        const [{ data: profile }, { data: banking }] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', user.id).single(),
            supabase.from('banking_details').select('*').eq('user_id', user.id).single(),
        ]);

        // Generate QR payload
        const qrPayload = generateQRPayload({
            id: invoice.id,
            matricule: invoice.matricule,
            issued: invoice.issue_date,
            total_cents: invoice.total_cents,
            currency: invoice.currency,
        });

        // Render QR code to base64 PNG data URL
        const qrDataUrl = await QRCode.toDataURL(qrPayload, {
            width: 200,
            margin: 1,
            color: { dark: '#000000', light: '#FFFFFF' },
            errorCorrectionLevel: 'H',
        });

        // Render PDF
        const pdfBuffer = await renderToBuffer(
            createElement(InvoicePDF, {
                invoice: invoice as Invoice,
                profile: (profile ?? {}) as Profile,
                banking: banking as BankingDetails | null,
                qrDataUrl,
            }) as any
        );

        return new NextResponse(new Uint8Array(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${invoice.matricule}.pdf"`,
                'Cache-Control': 'no-store',
            },
        });
    } catch (err) {
        console.error('[PDF] Error:', err);
        return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
    }
}
