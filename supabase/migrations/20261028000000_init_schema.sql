-- ============================================================================
-- LostGit Pay: Production Schema Migration
-- Migration: 20261028000000_init_schema.sql
-- Description: Core tables, enums, indexes, and triggers for LostGit Pay
-- Currency convention: ALL monetary values are stored in integer PAISE (1 INR = 100 paise)
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Helper trigger function for updated_at
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 2. Clients Table (Created first so profiles and projects can reference it)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    billing_address JSONB NOT NULL DEFAULT '{}'::jsonb,
    tax_id TEXT, -- GSTIN / PAN in India
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'invited')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 3. Profiles Table (extends Supabase auth.users)
-- ----------------------------------------------------------------------------
-- Drop any conflicting or empty starter template table if it existed
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('owner', 'admin', 'finance', 'support', 'client')),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_client_id ON profiles(client_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 4. Projects Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT,
    project_type TEXT NOT NULL DEFAULT 'web_app' CHECK (project_type IN ('website', 'web_app', 'mobile_app', 'software', 'maintenance', 'other')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('proposal', 'active', 'on_hold', 'completed', 'cancelled')),
    total_value_paise BIGINT NOT NULL DEFAULT 0 CHECK (total_value_paise >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    start_date DATE,
    end_date DATE,
    licence_key TEXT UNIQUE,
    entitlement_status TEXT NOT NULL DEFAULT 'active' CHECK (entitlement_status IN ('active', 'grace_period', 'pending_review', 'suspended', 'restored', 'expired', 'revoked')),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_licence_key ON projects(licence_key);

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 5. Invoices Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    invoice_type TEXT NOT NULL DEFAULT 'one_time' CHECK (invoice_type IN ('one_time', 'instalment', 'subscription', 'credit_note')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled', 'refunded', 'void')),
    subtotal_paise BIGINT NOT NULL DEFAULT 0 CHECK (subtotal_paise >= 0),
    tax_rate_percent NUMERIC(5,2) NOT NULL DEFAULT 18.00 CHECK (tax_rate_percent >= 0),
    tax_amount_paise BIGINT NOT NULL DEFAULT 0 CHECK (tax_amount_paise >= 0),
    discount_amount_paise BIGINT NOT NULL DEFAULT 0 CHECK (discount_amount_paise >= 0),
    total_amount_paise BIGINT NOT NULL DEFAULT 0 CHECK (total_amount_paise >= 0),
    amount_paid_paise BIGINT NOT NULL DEFAULT 0 CHECK (amount_paid_paise >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    payment_link_token TEXT UNIQUE,
    payment_link_expires_at TIMESTAMPTZ,
    razorpay_order_id TEXT,
    notes TEXT,
    terms TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_project_id ON invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_link_token ON invoices(payment_link_token);
CREATE INDEX IF NOT EXISTS idx_invoices_razorpay_order_id ON invoices(razorpay_order_id);

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 6. Invoice Line Items Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price_paise BIGINT NOT NULL CHECK (unit_price_paise >= 0),
    total_paise BIGINT NOT NULL CHECK (total_paise >= 0),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- ----------------------------------------------------------------------------
-- 7. Payment Plans Table (For Fixed-Term Instalments)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    total_amount_paise BIGINT NOT NULL CHECK (total_amount_paise > 0),
    number_of_instalments INT NOT NULL CHECK (number_of_instalments > 1),
    frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'milestone')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled', 'defaulted')),
    terms TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_plans_client_id ON payment_plans(client_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_invoice_id ON payment_plans(invoice_id);

DROP TRIGGER IF EXISTS update_payment_plans_updated_at ON payment_plans;
CREATE TRIGGER update_payment_plans_updated_at
    BEFORE UPDATE ON payment_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 8. Instalments Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS instalments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_plan_id UUID NOT NULL REFERENCES payment_plans(id) ON DELETE CASCADE,
    instalment_number INT NOT NULL CHECK (instalment_number > 0),
    amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'due', 'paid', 'partially_paid', 'overdue', 'cancelled')),
    amount_paid_paise BIGINT NOT NULL DEFAULT 0 CHECK (amount_paid_paise >= 0),
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    payment_link_token TEXT UNIQUE,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (payment_plan_id, instalment_number)
);

CREATE INDEX IF NOT EXISTS idx_instalments_payment_plan_id ON instalments(payment_plan_id);
CREATE INDEX IF NOT EXISTS idx_instalments_due_date ON instalments(due_date);
CREATE INDEX IF NOT EXISTS idx_instalments_status ON instalments(status);

DROP TRIGGER IF EXISTS update_instalments_updated_at ON instalments;
CREATE TRIGGER update_instalments_updated_at
    BEFORE UPDATE ON instalments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 9. Subscriptions Table (Recurring Maintenance / Retainers via Razorpay)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    plan_name TEXT NOT NULL,
    razorpay_plan_id TEXT,
    razorpay_subscription_id TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'authenticated', 'active', 'pending', 'halted', 'paused', 'cancelled', 'completed', 'expired')),
    billing_frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_frequency IN ('monthly', 'quarterly', 'yearly')),
    amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    current_start TIMESTAMPTZ,
    current_end TIMESTAMPTZ,
    next_billing_at TIMESTAMPTZ,
    charge_at TIMESTAMPTZ,
    failure_count INT NOT NULL DEFAULT 0,
    cancellation_reason TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_client_id ON subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_razorpay_id ON subscriptions(razorpay_subscription_id);

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 10. Payments Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    instalment_id UUID REFERENCES instalments(id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    payment_method TEXT, -- card, netbanking, wallet, upi, emi, etc.
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT UNIQUE,
    razorpay_signature TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded')),
    error_code TEXT,
    error_description TEXT,
    receipt_number TEXT UNIQUE,
    captured_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_receipt_number ON payments(receipt_number);

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 11. Refunds Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
    razorpay_refund_id TEXT UNIQUE,
    amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'processing', 'processed', 'failed')),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_razorpay_refund_id ON refunds(razorpay_refund_id);

DROP TRIGGER IF EXISTS update_refunds_updated_at ON refunds;
CREATE TRIGGER update_refunds_updated_at
    BEFORE UPDATE ON refunds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 12. Webhook Events Table (Idempotency and Audit)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT NOT NULL UNIQUE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processing', 'processed', 'failed', 'skipped')),
    error_message TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_type ON webhook_events(event_type);

-- ----------------------------------------------------------------------------
-- 13. Licences Table (Software / App Entitlement Management)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS licences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    licence_key TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'rotated')),
    allowed_domains TEXT[] NOT NULL DEFAULT '{}',
    valid_until TIMESTAMPTZ,
    grace_period_until TIMESTAMPTZ,
    last_checked_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_licences_project_id ON licences(project_id);
CREATE INDEX IF NOT EXISTS idx_licences_licence_key ON licences(licence_key);
CREATE INDEX IF NOT EXISTS idx_licences_status ON licences(status);

DROP TRIGGER IF EXISTS update_licences_updated_at ON licences;
CREATE TRIGGER update_licences_updated_at
    BEFORE UPDATE ON licences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 14. Audit Logs Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ----------------------------------------------------------------------------
-- 15. Business Settings Table (Single-row configuration)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS business_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    company_name TEXT NOT NULL DEFAULT 'LostGit Solutions',
    company_email TEXT NOT NULL DEFAULT 'billing@lostgit.com',
    company_phone TEXT DEFAULT '+91 99999 99999',
    company_website TEXT DEFAULT 'https://lostgit.com',
    company_address JSONB NOT NULL DEFAULT '{"street": "Tech Park", "city": "Bangalore", "state": "Karnataka", "postal_code": "560001", "country": "India"}'::jsonb,
    gstin TEXT,
    pan TEXT,
    default_tax_rate NUMERIC(5,2) NOT NULL DEFAULT 18.00,
    invoice_prefix TEXT NOT NULL DEFAULT 'INV',
    receipt_prefix TEXT NOT NULL DEFAULT 'RCT',
    default_payment_terms_days INT NOT NULL DEFAULT 15,
    default_grace_period_days INT NOT NULL DEFAULT 7,
    default_terms TEXT DEFAULT 'Payment is due within the stipulated period. Late payments may attract service suspension after grace period.',
    bank_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    razorpay_live_configured BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default row if not exists
INSERT INTO business_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
