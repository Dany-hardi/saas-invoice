import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
    Font,
} from '@react-pdf/renderer';
import { Invoice, BankingDetails, Profile } from '@/types/invoice';
import { formatCurrency, formatDate } from '@/lib/utils';

// Register a clean font pair
Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.woff2', fontWeight: 600 },
        { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiA.woff2', fontWeight: 700 },
    ],
});

const BRAND = '#6366F1';
const DARK = '#0A0A0B';
const GRAY = '#71717A';
const LIGHT = '#FAFAFA';
const BORDER = '#E4E4E7';

const s = StyleSheet.create({
    page: {
        fontFamily: 'Inter',
        backgroundColor: '#FFFFFF',
        padding: 0,
        fontSize: 9,
        color: DARK,
        position: 'relative',
    },
    // Header band
    header: {
        backgroundColor: DARK,
        paddingHorizontal: 36,
        paddingTop: 28,
        paddingBottom: 24,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    headerLeft: { flex: 1 },
    headerRight: { alignItems: 'flex-end' },

    // QR codes
    qrTopLeft: {
        position: 'absolute',
        top: 20,
        left: 20,
        width: 54,
        height: 54,
        padding: 4,
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
    },
    qrBottomRight: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 54,
        height: 54,
        padding: 4,
        backgroundColor: DARK,
        borderRadius: 4,
    },
    qrLabel: {
        fontSize: 5,
        letterSpacing: 0.3,
        textAlign: 'center',
        marginTop: 2,
    },

    // Company info
    companyName: {
        fontSize: 14,
        fontWeight: 700,
        color: '#FFFFFF',
        letterSpacing: -0.3,
        marginBottom: 2,
    },
    companyDetail: { fontSize: 8, color: '#A1A1AA', marginBottom: 1.5 },

    // Invoice badge
    invoiceBadge: {
        backgroundColor: BRAND,
        borderRadius: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginBottom: 6,
        alignSelf: 'flex-end',
    },
    invoiceBadgeText: { color: '#FFFFFF', fontSize: 7, fontWeight: 600, letterSpacing: 1.5 },
    matricule: {
        fontSize: 20,
        fontWeight: 700,
        color: '#FFFFFF',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    headerMeta: { fontSize: 8, color: '#A1A1AA', marginBottom: 1.5 },

    // Body
    body: { paddingHorizontal: 36, paddingTop: 24 },

    // Bill To / From section
    partiesRow: { flexDirection: 'row', marginBottom: 24, gap: 24 },
    partyBox: {
        flex: 1,
        padding: 14,
        backgroundColor: '#FAFAFA',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: BORDER,
    },
    partyTitle: {
        fontSize: 6.5,
        fontWeight: 600,
        color: GRAY,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 6,
    },
    partyName: { fontSize: 10, fontWeight: 700, color: DARK, marginBottom: 2 },
    partyDetail: { fontSize: 8, color: GRAY, marginBottom: 1.5 },

    // Line items table
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
        paddingBottom: 6,
        marginBottom: 4,
    },
    tableHeaderCell: {
        fontSize: 6.5,
        fontWeight: 600,
        color: GRAY,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 7,
        borderBottomWidth: 1,
        borderBottomColor: '#F4F4F5',
    },
    tableRowAlt: { backgroundColor: '#FAFAFA' },
    cell: { fontSize: 8.5, color: DARK },
    cellDesc: { flex: 3 },
    cellQty: { flex: 0.7, textAlign: 'right' },
    cellRate: { flex: 1.2, textAlign: 'right' },
    cellAmount: { flex: 1.2, textAlign: 'right', fontWeight: 600 },

    // Totals
    totalsBox: {
        marginTop: 16,
        alignSelf: 'flex-end',
        width: 220,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 8,
        overflow: 'hidden',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
    },
    totalLabel: { fontSize: 8, color: GRAY },
    totalValue: { fontSize: 8, color: DARK },
    totalGrandRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: DARK,
    },
    totalGrandLabel: { fontSize: 9, fontWeight: 700, color: '#FFFFFF' },
    totalGrandValue: { fontSize: 12, fontWeight: 700, color: BRAND },

    // Notes & Terms
    notesSection: { marginTop: 20 },
    notesSectionTitle: {
        fontSize: 6.5,
        fontWeight: 600,
        color: GRAY,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 5,
    },
    notesText: { fontSize: 8, color: GRAY, lineHeight: 1.5 },

    // Banking
    bankingSection: {
        marginTop: 20,
        padding: 14,
        backgroundColor: '#F8F8FF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: `${BRAND}33`,
    },
    bankingTitle: {
        fontSize: 6.5,
        fontWeight: 600,
        color: BRAND,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    bankRow: { flexDirection: 'row', marginBottom: 3, gap: 8 },
    bankLabel: { fontSize: 7.5, color: GRAY, width: 70 },
    bankValue: { fontSize: 7.5, color: DARK, fontWeight: 600, flex: 1 },

    // Footer
    footer: {
        marginTop: 28,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: BORDER,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 36,
        paddingBottom: 32,
    },
    footerText: { fontSize: 7, color: GRAY },
    footerBrand: { fontSize: 7, color: BRAND, fontWeight: 600 },

    // Signature
    signatureSection: { alignItems: 'flex-end', marginTop: 20 },
    signatureLine: {
        width: 140,
        height: 1,
        backgroundColor: BORDER,
        marginBottom: 4,
    },
    signatureLabel: { fontSize: 7, color: GRAY },
    signatureImage: { width: 100, height: 40, marginBottom: 2 },
});

interface InvoicePDFProps {
    invoice: Invoice;
    profile: Profile;
    banking: BankingDetails | null;
    qrDataUrl: string; // base64 PNG of QR code
}

export function InvoicePDF({ invoice, profile, banking, qrDataUrl }: InvoicePDFProps) {
    const lineItems = invoice.line_items ?? [];
    const cur = invoice.currency;

    return (
        <Document
            title={`Invoice ${invoice.matricule}`}
            author={profile.full_name ?? 'InvoiceOS'}
        >
            <Page size="A4" style={s.page}>
                {/* ─── QR CODE: TOP LEFT (anti-fraud, light bg) ─── */}
                <View style={s.qrTopLeft}>
                    <Image src={qrDataUrl} style={{ width: 46, height: 46 }} />
                    <Text style={[s.qrLabel, { color: GRAY }]}>VERIFY</Text>
                </View>

                {/* ─── DARK HEADER BAND ─── */}
                <View style={s.header}>
                    {/* Offset left col to clear QR code */}
                    <View style={[s.headerLeft, { paddingLeft: 56 }]}>
                        <Text style={s.companyName}>
                            {profile.company_name ?? profile.full_name ?? 'InvoiceOS'}
                        </Text>
                        {profile.email && <Text style={s.companyDetail}>{profile.email}</Text>}
                        {profile.address && <Text style={s.companyDetail}>{profile.address}</Text>}
                        {profile.vat_number && (
                            <Text style={s.companyDetail}>VAT: {profile.vat_number}</Text>
                        )}
                    </View>

                    <View style={s.headerRight}>
                        <View style={s.invoiceBadge}>
                            <Text style={s.invoiceBadgeText}>INVOICE</Text>
                        </View>
                        <Text style={s.matricule}>{invoice.matricule}</Text>
                        <Text style={s.headerMeta}>Issued: {formatDate(invoice.issue_date)}</Text>
                        {invoice.due_date && (
                            <Text style={s.headerMeta}>Due: {formatDate(invoice.due_date)}</Text>
                        )}
                        <Text style={[s.headerMeta, { marginTop: 4, color: BRAND, fontWeight: 600 }]}>
                            Status: {invoice.status.toUpperCase()}
                        </Text>
                    </View>
                </View>

                {/* ─── BODY ─── */}
                <View style={s.body}>
                    {/* Bill To / Issued By */}
                    <View style={s.partiesRow}>
                        <View style={s.partyBox}>
                            <Text style={s.partyTitle}>Bill To</Text>
                            <Text style={s.partyName}>{invoice.clients?.name ?? '—'}</Text>
                            {invoice.clients?.email && (
                                <Text style={s.partyDetail}>{invoice.clients.email}</Text>
                            )}
                            {invoice.clients?.address && (
                                <Text style={s.partyDetail}>{invoice.clients.address}</Text>
                            )}
                            {invoice.clients?.vat_number && (
                                <Text style={s.partyDetail}>VAT: {invoice.clients.vat_number}</Text>
                            )}
                        </View>

                        <View style={s.partyBox}>
                            <Text style={s.partyTitle}>Issued By</Text>
                            <Text style={s.partyName}>
                                {profile.company_name ?? profile.full_name ?? '—'}
                            </Text>
                            {profile.phone && <Text style={s.partyDetail}>{profile.phone}</Text>}
                            {profile.city && profile.country && (
                                <Text style={s.partyDetail}>
                                    {profile.city}, {profile.country}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Line Items */}
                    <View>
                        <View style={s.tableHeader}>
                            <Text style={[s.tableHeaderCell, { flex: 3 }]}>Description</Text>
                            <Text style={[s.tableHeaderCell, { flex: 0.7, textAlign: 'right' }]}>Qty</Text>
                            <Text style={[s.tableHeaderCell, { flex: 1.2, textAlign: 'right' }]}>Rate</Text>
                            <Text style={[s.tableHeaderCell, { flex: 1.2, textAlign: 'right' }]}>Amount</Text>
                        </View>

                        {lineItems.map((item, i) => (
                            <View
                                key={item.id}
                                style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}
                            >
                                <Text style={[s.cell, s.cellDesc]}>{item.description}</Text>
                                <Text style={[s.cell, s.cellQty]}>{item.quantity}</Text>
                                <Text style={[s.cell, s.cellRate]}>
                                    {formatCurrency(item.unit_price_cents, cur)}
                                </Text>
                                <Text style={[s.cell, s.cellAmount]}>
                                    {formatCurrency(item.amount_cents, cur)}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Totals */}
                    <View style={s.totalsBox}>
                        <View style={s.totalRow}>
                            <Text style={s.totalLabel}>Subtotal</Text>
                            <Text style={s.totalValue}>
                                {formatCurrency(invoice.subtotal_cents, cur)}
                            </Text>
                        </View>
                        {invoice.discount_cents > 0 && (
                            <View style={s.totalRow}>
                                <Text style={s.totalLabel}>Discount</Text>
                                <Text style={[s.totalValue, { color: '#22C55E' }]}>
                                    −{formatCurrency(invoice.discount_cents, cur)}
                                </Text>
                            </View>
                        )}
                        <View style={s.totalRow}>
                            <Text style={s.totalLabel}>Tax ({invoice.tax_rate}%)</Text>
                            <Text style={s.totalValue}>
                                {formatCurrency(invoice.tax_cents, cur)}
                            </Text>
                        </View>
                        <View style={s.totalGrandRow}>
                            <Text style={s.totalGrandLabel}>TOTAL DUE</Text>
                            <Text style={s.totalGrandValue}>
                                {formatCurrency(invoice.total_cents, cur)}
                            </Text>
                        </View>
                    </View>

                    {/* Signature */}
                    {invoice.signature_url && (
                        <View style={s.signatureSection}>
                            <Image src={invoice.signature_url} style={s.signatureImage} />
                            <View style={s.signatureLine} />
                            <Text style={s.signatureLabel}>Authorised Signature</Text>
                        </View>
                    )}

                    {/* Banking Details */}
                    {banking && (banking.iban || banking.bank_name) && (
                        <View style={s.bankingSection}>
                            <Text style={s.bankingTitle}>Payment Details</Text>
                            {banking.bank_name && (
                                <View style={s.bankRow}>
                                    <Text style={s.bankLabel}>Bank</Text>
                                    <Text style={s.bankValue}>{banking.bank_name}</Text>
                                </View>
                            )}
                            {banking.iban && (
                                <View style={s.bankRow}>
                                    <Text style={s.bankLabel}>IBAN</Text>
                                    <Text style={s.bankValue}>{banking.iban}</Text>
                                </View>
                            )}
                            {banking.swift_bic && (
                                <View style={s.bankRow}>
                                    <Text style={s.bankLabel}>SWIFT/BIC</Text>
                                    <Text style={s.bankValue}>{banking.swift_bic}</Text>
                                </View>
                            )}
                            {banking.stripe_link && (
                                <View style={s.bankRow}>
                                    <Text style={s.bankLabel}>Pay via Stripe</Text>
                                    <Text style={[s.bankValue, { color: BRAND }]}>{banking.stripe_link}</Text>
                                </View>
                            )}
                            {banking.paypal_link && (
                                <View style={s.bankRow}>
                                    <Text style={s.bankLabel}>PayPal</Text>
                                    <Text style={[s.bankValue, { color: BRAND }]}>{banking.paypal_link}</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Notes */}
                    {invoice.notes && (
                        <View style={s.notesSection}>
                            <Text style={s.notesSectionTitle}>Notes</Text>
                            <Text style={s.notesText}>{invoice.notes}</Text>
                        </View>
                    )}

                    {/* Terms */}
                    {invoice.terms && (
                        <View style={[s.notesSection, { marginTop: 8 }]}>
                            <Text style={s.notesSectionTitle}>Terms & Conditions</Text>
                            <Text style={s.notesText}>{invoice.terms}</Text>
                        </View>
                    )}
                </View>

                {/* ─── FOOTER ─── */}
                <View style={s.footer}>
                    <View>
                        <Text style={s.footerText}>
                            Generated by{' '}
                            <Text style={s.footerBrand}>InvoiceOS</Text>
                        </Text>
                        <Text style={s.footerText}>
                            Auth ID: {invoice.auth_hash ?? '—'}
                        </Text>
                    </View>
                    <Text style={s.footerText}>
                        {invoice.matricule} • {formatDate(invoice.issue_date)}
                    </Text>
                </View>

                {/* ─── QR CODE: BOTTOM RIGHT (dark bg, inverted) ─── */}
                <View style={s.qrBottomRight}>
                    <Image src={qrDataUrl} style={{ width: 46, height: 46 }} />
                    <Text style={[s.qrLabel, { color: '#A1A1AA' }]}>VERIFY</Text>
                </View>
            </Page>
        </Document>
    );
}
