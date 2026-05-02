import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatCurrency, formatDate } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';

export default async function PublicInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, clients(*), line_items(*)')
    .eq('id', id)
    .single();

  if (!invoice) notFound();

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
      <h1 className="text-2xl font-bold">Invoice {invoice.matricule}</h1>
      <p>Issued {formatDate(invoice.issue_date)} • Due {formatDate(invoice.due_date)}</p>
      <table className="data-table mt-4">
        <thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
        <tbody>
          {invoice.line_items?.map((item: { id: string; description: string; quantity: number; unit_price_cents: number; amount_cents: number }) => (
            <tr key={item.id}><td>{item.description}</td><td>{item.quantity}</td><td>{formatCurrency(item.unit_price_cents, invoice.currency)}</td><td>{formatCurrency(item.amount_cents, invoice.currency)}</td></tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 text-right font-semibold">Total: {formatCurrency(invoice.total_cents, invoice.currency)}</div>
      <div className="mt-6">
        <Link href={`/api/pdf/${invoice.id}`} className="btn-primary">Download PDF</Link>
      </div>
    </div>
  );
}
