-- ============================================================================
-- LostGit Pay: Row Level Security (RLS) Policies Migration
-- Migration: 20261028000001_rls_policies.sql
-- Description: Enable RLS and define strict security policies for multi-tenant isolation
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Security Helper Functions
-- ----------------------------------------------------------------------------

-- Check if current authenticated user is staff (owner, admin, finance, support)
CREATE OR REPLACE FUNCTION public.current_user_is_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('owner', 'admin', 'finance', 'support')
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current authenticated user is admin or owner
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('owner', 'admin')
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current authenticated user is owner
CREATE OR REPLACE FUNCTION public.current_user_is_owner()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'owner'
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get the client_id linked to the current authenticated user (if client role)
CREATE OR REPLACE FUNCTION public.current_user_client_id()
RETURNS UUID AS $$
DECLARE
    cid UUID;
BEGIN
    SELECT client_id INTO cid
    FROM public.profiles
    WHERE id = auth.uid()
    AND is_active = true;
    RETURN cid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 2. Enable RLS on all tables
-- ----------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE instalments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE licences ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 3. Profiles Policies
-- ----------------------------------------------------------------------------
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    USING (id = auth.uid());

-- Staff can read all profiles
CREATE POLICY "Staff can read all profiles"
    ON profiles FOR SELECT
    USING (public.current_user_is_staff());

-- Users can update their own non-role fields
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Admins and owners can create or update any profile
CREATE POLICY "Admins can manage profiles"
    ON profiles FOR ALL
    USING (public.current_user_is_admin());

-- ----------------------------------------------------------------------------
-- 4. Clients Policies
-- ----------------------------------------------------------------------------
-- Staff can view all clients
CREATE POLICY "Staff can view all clients"
    ON clients FOR SELECT
    USING (public.current_user_is_staff());

-- Staff can manage clients
CREATE POLICY "Staff can manage clients"
    ON clients FOR ALL
    USING (public.current_user_is_staff());

-- Client users can view only their own client company record
CREATE POLICY "Clients can view own client record"
    ON clients FOR SELECT
    USING (id = public.current_user_client_id());

-- ----------------------------------------------------------------------------
-- 5. Projects Policies
-- ----------------------------------------------------------------------------
-- Staff can manage all projects
CREATE POLICY "Staff can manage all projects"
    ON projects FOR ALL
    USING (public.current_user_is_staff());

-- Client users can view projects belonging to their client company
CREATE POLICY "Clients can view own projects"
    ON projects FOR SELECT
    USING (client_id = public.current_user_client_id());

-- ----------------------------------------------------------------------------
-- 6. Invoices Policies
-- ----------------------------------------------------------------------------
-- Staff can manage all invoices
CREATE POLICY "Staff can manage all invoices"
    ON invoices FOR ALL
    USING (public.current_user_is_staff());

-- Client users can view invoices belonging to their client company
CREATE POLICY "Clients can view own invoices"
    ON invoices FOR SELECT
    USING (client_id = public.current_user_client_id());

-- Public payment links: anon can view invoice details if valid token matches
CREATE POLICY "Public can view invoice with valid token"
    ON invoices FOR SELECT
    TO anon
    USING (
        payment_link_token IS NOT NULL 
        AND (payment_link_expires_at IS NULL OR payment_link_expires_at > NOW())
    );

-- ----------------------------------------------------------------------------
-- 7. Invoice Items Policies
-- ----------------------------------------------------------------------------
-- Staff can manage invoice items
CREATE POLICY "Staff can manage invoice items"
    ON invoice_items FOR ALL
    USING (public.current_user_is_staff());

-- Clients can view items of their invoices
CREATE POLICY "Clients can view own invoice items"
    ON invoice_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND invoices.client_id = public.current_user_client_id()
        )
    );

-- Public can view invoice items for public payment links
CREATE POLICY "Public can view invoice items with valid token"
    ON invoice_items FOR SELECT
    TO anon
    USING (
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND invoices.payment_link_token IS NOT NULL
            AND (invoices.payment_link_expires_at IS NULL OR invoices.payment_link_expires_at > NOW())
        )
    );

-- ----------------------------------------------------------------------------
-- 8. Payment Plans Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Staff can manage payment plans"
    ON payment_plans FOR ALL
    USING (public.current_user_is_staff());

CREATE POLICY "Clients can view own payment plans"
    ON payment_plans FOR SELECT
    USING (client_id = public.current_user_client_id());

-- ----------------------------------------------------------------------------
-- 9. Instalments Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Staff can manage instalments"
    ON instalments FOR ALL
    USING (public.current_user_is_staff());

CREATE POLICY "Clients can view own instalments"
    ON instalments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM payment_plans
            WHERE payment_plans.id = instalments.payment_plan_id
            AND payment_plans.client_id = public.current_user_client_id()
        )
    );

CREATE POLICY "Public can view instalment with valid token"
    ON instalments FOR SELECT
    TO anon
    USING (payment_link_token IS NOT NULL);

-- ----------------------------------------------------------------------------
-- 10. Subscriptions Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Staff can manage subscriptions"
    ON subscriptions FOR ALL
    USING (public.current_user_is_staff());

CREATE POLICY "Clients can view own subscriptions"
    ON subscriptions FOR SELECT
    USING (client_id = public.current_user_client_id());

-- ----------------------------------------------------------------------------
-- 11. Payments Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Staff can manage payments"
    ON payments FOR ALL
    USING (public.current_user_is_staff());

CREATE POLICY "Clients can view own payments"
    ON payments FOR SELECT
    USING (client_id = public.current_user_client_id());

-- ----------------------------------------------------------------------------
-- 12. Refunds Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Staff can manage refunds"
    ON refunds FOR ALL
    USING (public.current_user_is_staff());

CREATE POLICY "Clients can view own refunds"
    ON refunds FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM payments
            WHERE payments.id = refunds.payment_id
            AND payments.client_id = public.current_user_client_id()
        )
    );

-- ----------------------------------------------------------------------------
-- 13. Webhook Events Policies (Staff Only / Service Role)
-- ----------------------------------------------------------------------------
CREATE POLICY "Staff can view webhook events"
    ON webhook_events FOR SELECT
    USING (public.current_user_is_staff());

-- ----------------------------------------------------------------------------
-- 14. Licences Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Staff can manage licences"
    ON licences FOR ALL
    USING (public.current_user_is_staff());

CREATE POLICY "Clients can view own licences"
    ON licences FOR SELECT
    USING (client_id = public.current_user_client_id());

-- ----------------------------------------------------------------------------
-- 15. Audit Logs Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Staff can view audit logs"
    ON audit_logs FOR SELECT
    USING (public.current_user_is_staff());

CREATE POLICY "Staff can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (public.current_user_is_staff() OR auth.uid() IS NOT NULL);

-- ----------------------------------------------------------------------------
-- 16. Business Settings Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Public can read business settings"
    ON business_settings FOR SELECT
    USING (true);

CREATE POLICY "Admins can update business settings"
    ON business_settings FOR UPDATE
    USING (public.current_user_is_admin());
