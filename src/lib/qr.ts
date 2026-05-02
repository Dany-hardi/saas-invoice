/**
 * Generate a QR authentication payload for an invoice.
 * Encodes critical data into a verifiable JSON string for fraud prevention.
 */
export function generateQRPayload(params: {
    id: string;
    matricule: string;
    issued: string;
    total_cents: number;
    currency: string;
}): string {
    // Simple deterministic hash from invoice fields
    const raw = `${params.id}|${params.matricule}|${params.issued}|${params.total_cents}`;
    const hash = btoa(raw).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16).toUpperCase();

    const payload = {
        id: params.id,
        ref: params.matricule,
        dt: params.issued,
        amt: params.total_cents,
        cur: params.currency,
        sig: hash,
        v: '1',
    };

    return JSON.stringify(payload);
}

/**
 * Extract the auth hash from a QR payload for storage in DB
 */
export function extractAuthHash(params: {
    id: string;
    matricule: string;
    issued: string;
    total_cents: number;
}): string {
    const raw = `${params.id}|${params.matricule}|${params.issued}|${params.total_cents}`;
    return btoa(raw).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16).toUpperCase();
}
