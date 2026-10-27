# LostGit Pay — Database Schema & Security Architecture

All database tables are managed in `supabase/migrations/` with PostgreSQL Row Level Security (RLS) enabled on every table.

---

## 1. Table Definitions

### `profiles`
Extends `auth.users` with LostGit role-based permissions and profile metadata.
- `id` (UUID, PK, references `auth.users.id`)
- `email` (TEXT, UNIQUE)
- `full_name` (TEXT)
- `role` (TEXT: `'owner' | 'admin' | 'finance' | 'support' | 'client'`)
- `client_id` (UUID, nullable, references `clients.id` for client users)
- `phone` (TEXT)
- `avatar_url` (TEXT)
- `is_active` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### `clients`
Represents client businesses billed by LostGit Solutions.
- `id` (UUID, PK)
- `business_name` (TEXT)
- `contact_name` (TEXT)
- `email` (TEXT)
- `phone` (TEXT)
- `billing_address` (JSONB)
- `tax_id` (TEXT — GSTIN/PAN)
- `status` (`'active' | 'inactive' | 'suspended' | 'invited'`)
- `notes` (TEXT)

### `projects`
Projects, software systems, or maintenance agreements delivered to clients.
- `id` (UUID, PK)
- `client_id` (UUID, references `clients.id`)
- `name` (TEXT)
- `description` (TEXT)
- `project_type` (`'website' | 'web_app' | 'mobile_app' | 'software' | 'maintenance' | 'other'`)
- `status` (`'proposal' | 'active' | 'on_hold' | 'completed' | 'cancelled'`)
- `total_value_paise` (BIGINT, integer minor units)
- `currency` (TEXT, default `'INR'`)
- `start_date`, `end_date` (DATE)
- `licence_key` (TEXT, UNIQUE)
- `entitlement_status` (`'active' | 'grace_period' | 'pending_review' | 'suspended' | 'restored' | 'expired' | 'revoked'`)

### `invoices` & `invoice_items`
Detailed billing invoices with line items and exact paise calculation.
- `id` (UUID, PK)
- `invoice_number` (TEXT, UNIQUE, e.g. `INV-2026-0001`)
- `client_id` (UUID, references `clients.id`)
- `subtotal_paise` (BIGINT)
- `tax_rate_percent` (NUMERIC)
- `tax_amount_paise` (BIGINT)
- `discount_amount_paise` (BIGINT)
- `total_amount_paise` (BIGINT)
- `amount_paid_paise` (BIGINT)
- `status` (`'draft' | 'issued' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled' | 'refunded' | 'void'`)
- `payment_link_token` (TEXT, UNIQUE)
- `payment_link_expires_at` (TIMESTAMPTZ)
- `razorpay_order_id` (TEXT)

### `payment_plans` & `instalments`
Milestone and fixed-term split instalments.
- Guarantees `sum(instalments) == total_amount_paise` with zero precision loss.
- Each instalment tracks `due_date`, `amount_paise`, `status`, and `amount_paid_paise`.

### `subscriptions`
Recurring maintenance and retainers integrated with Razorpay Subscriptions / UPI AutoPay.
- `razorpay_plan_id` (TEXT)
- `razorpay_subscription_id` (TEXT, UNIQUE)
- `status` (`'created' | 'authenticated' | 'active' | 'pending' | 'halted' | 'paused' | 'cancelled' | 'completed' | 'expired'`)
- `billing_frequency` (`'monthly' | 'quarterly' | 'yearly'`)
- `amount_paise` (BIGINT)

### `payments`
Recorded payment transactions with payment method, order ID, payment ID, and generated receipt number.

### `webhook_events`
Stores every incoming Razorpay webhook payload for idempotency and audit trail.

### `licences`
Real-time software licence entitlement records linking projects to allowed domains, valid dates, and grace periods.

### `audit_logs`
Immutable record of all administrative and financial actions with timestamp, actor, IP address, and changed details.

---

## 2. Row Level Security (RLS)

| Table | Staff Access | Client Access | Public Access |
|---|---|---|---|
| `profiles` | Read all / Admin manage | Read own profile | None |
| `clients` | Full CRUD | Read own business record | None |
| `projects` | Full CRUD | Read own projects | None |
| `invoices` | Full CRUD | Read own invoices | Read with valid `payment_link_token` |
| `invoice_items` | Full CRUD | Read own items | Read with valid `payment_link_token` |
| `payments` | Full CRUD | Read own payments | None |
| `licences` | Full CRUD | Read own licences | Public via verification API |
| `webhook_events` | Staff read-only | None | None |
| `audit_logs` | Staff read-only | None | None |
