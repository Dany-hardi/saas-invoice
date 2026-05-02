-- ============================================================
-- SAAS INVOICE — INITIAL SCHEMA
-- ============================================================
-- Run this in your Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- SEQUENCES TABLE (Matricule Engine)
-- ============================================================
CREATE TABLE IF NOT EXISTS invoice_sequences (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prefix      TEXT NOT NULL DEFAULT 'DEV',
  year        INTEGER NOT NULL,
  last_seq    INTEGER NOT NULL DEFAULT 0,
  UNIQUE(prefix, year)
);

-- Atomic Matricule Generator
CREATE OR REPLACE FUNCTION generate_matricule(p_prefix TEXT, p_year INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_seq INTEGER;
BEGIN
  INSERT INTO invoice_sequences(prefix, year, last_seq)
  VALUES (p_prefix, p_year, 0)
  ON CONFLICT (prefix, year) DO NOTHING;

  UPDATE invoice_sequences
  SET last_seq = last_seq + 1
  WHERE prefix = p_prefix AND year = p_year
  RETURNING last_seq INTO v_seq;

  RETURN p_prefix || '-' || p_year::TEXT || '-' || LPAD(v_seq::TEXT, 4, '0');
END;
$$;

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT,
  company_name    TEXT,
  email           TEXT,
  phone           TEXT,
  address         TEXT,
  city            TEXT,
  country         TEXT,
  vat_number      TEXT,
  invoice_prefix  TEXT NOT NULL DEFAULT 'DEV',
  signature_url   TEXT,
  logo_url        TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CLIENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS clients (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT,
  address     TEXT,
  city        TEXT,
  country     TEXT,
  vat_number  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INVOICES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS invoices (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id         UUID REFERENCES clients(id) ON DELETE SET NULL,
  
  matricule         TEXT UNIQUE NOT NULL DEFAULT '',
  prefix            TEXT NOT NULL DEFAULT 'DEV',
  
  status            TEXT NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft', 'pending', 'paid', 'overdue', 'cancelled')),
  
  issue_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date          DATE,
  
  currency          TEXT NOT NULL DEFAULT 'EUR',
  subtotal_cents    BIGINT NOT NULL DEFAULT 0,
  tax_rate          NUMERIC(5,2) NOT NULL DEFAULT 0,
  tax_cents         BIGINT NOT NULL DEFAULT 0,
  discount_cents    BIGINT NOT NULL DEFAULT 0,
  total_cents       BIGINT NOT NULL DEFAULT 0,
  
  notes             TEXT,
  terms             TEXT,
  signature_url     TEXT,
  
  -- QR Code auth payload (stored for verification)
  auth_hash         TEXT,
  
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: auto-assign matricule on INSERT
CREATE OR REPLACE FUNCTION assign_matricule()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.matricule = '' THEN
    NEW.matricule := generate_matricule(NEW.prefix, EXTRACT(YEAR FROM NEW.issue_date)::INTEGER);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_matricule ON invoices;
CREATE TRIGGER trg_assign_matricule
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION assign_matricule();

-- ============================================================
-- LINE ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS line_items (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id        UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  position          INTEGER NOT NULL DEFAULT 0,
  description       TEXT NOT NULL,
  quantity          NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price_cents  BIGINT NOT NULL DEFAULT 0,
  amount_cents      BIGINT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BANKING DETAILS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS banking_details (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_name       TEXT,
  iban            TEXT,
  swift_bic       TEXT,
  routing_number  TEXT,
  account_number  TEXT,
  stripe_link     TEXT,
  paypal_link     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE clients         ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices        ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE banking_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Own clients"         ON clients;
DROP POLICY IF EXISTS "Own invoices"        ON invoices;
DROP POLICY IF EXISTS "Own line_items"      ON line_items;
DROP POLICY IF EXISTS "Own banking_details" ON banking_details;
DROP POLICY IF EXISTS "Own profile"         ON profiles;

CREATE POLICY "Own clients"         ON clients          FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own invoices"        ON invoices         FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own line_items"      ON line_items       FOR ALL
  USING (invoice_id IN (SELECT id FROM invoices WHERE user_id = auth.uid()));
CREATE POLICY "Own banking_details" ON banking_details  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own profile"         ON profiles         FOR ALL USING (auth.uid() = id);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_invoices_user_id   ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status    ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date  ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_line_items_invoice ON line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id    ON clients(user_id);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
