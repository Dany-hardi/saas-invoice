export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface Profile {
    id: string;
    full_name: string | null;
    company_name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    vat_number: string | null;
    invoice_prefix: string;
    signature_url: string | null;
    logo_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface Client {
    id: string;
    user_id: string;
    name: string;
    email: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    vat_number: string | null;
    created_at: string;
    updated_at: string;
}

export interface LineItem {
    id: string;
    invoice_id: string;
    position: number;
    description: string;
    quantity: number;
    unit_price_cents: number;
    amount_cents: number;
    created_at: string;
}

export interface LineItemDraft {
    id: string; // local uuid for React key
    description: string;
    quantity: number;
    unit_price_cents: number;
}

export interface Invoice {
    id: string;
    user_id: string;
    client_id: string | null;
    matricule: string;
    prefix: string;
    status: InvoiceStatus;
    issue_date: string;
    due_date: string | null;
    currency: string;
    subtotal_cents: number;
    tax_rate: number;
    tax_cents: number;
    discount_cents: number;
    total_cents: number;
    notes: string | null;
    terms: string | null;
    signature_url: string | null;
    auth_hash: string | null;
    created_at: string;
    updated_at: string;
    // joined
    clients?: Client | null;
    line_items?: LineItem[];
}

export interface InvoiceWithRelations extends Invoice {
    clients: Client | null;
    line_items: LineItem[];
}

export interface BankingDetails {
    id: string;
    user_id: string;
    bank_name: string | null;
    iban: string | null;
    swift_bic: string | null;
    routing_number: string | null;
    account_number: string | null;
    stripe_link: string | null;
    paypal_link: string | null;
    created_at: string;
    updated_at: string;
}

export interface InvoiceFormData {
    client_id: string;
    issue_date: string;
    due_date: string;
    currency: string;
    tax_rate: number;
    discount_cents: number;
    notes: string;
    terms: string;
    line_items: LineItemDraft[];
}

export interface DashboardStats {
    totalRevenue: number;
    pending: number;
    overdue: number;
    paid: number;
    recentInvoices: Invoice[];
}

export interface QRAuthPayload {
    id: string;
    matricule: string;
    issued: string;
    total: number;
    currency: string;
    hash: string;
}
