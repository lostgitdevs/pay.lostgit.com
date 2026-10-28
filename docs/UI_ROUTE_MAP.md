# LostGit Pay — Information Architecture & UI Route Map

**Document Version:** 1.0.0  
**Status:** Implemented  

---

## 1. Global Navigation Architecture

The LostGit Pay platform separates user interactions by authenticated role:
1. **LostGit Platform Operator (Owner / Admin / Finance / Support)**: Full access to the executive financial dashboard, clients directory, projects management, invoicing, Razorpay transaction ledger, telemetry analytics, and licence entitlement controls.
2. **Client Member / Business Representative**: Scoped access restricted strictly to their company's invoices, instalment plans, payment receipts, licence keys, and shared telemetry.
3. **Public / Unauthenticated Visitor**: Checkout portal (`/pay/[token]`), landing overview (`/`), and secure login (`/login`).

---

## 2. Complete Route Map & Access Control Matrix

| Route Path | View Purpose | Primary Components & Data | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `/` | Brand Landing & Marketing | Product capabilities, security guarantees, login links | Public |
| `/login` | Secure Authentication | Email/password login, magic links, session recovery | Public |
| `/pay/[token]` | Client Checkout Portal | Milestone details, Razorpay checkout modal, UPI AutoPay mandate | Public (Token-authorized) |
| `/dashboard` (alias `/admin`) | Executive Command Center | Financial KPIs, revenue trend chart, payment breakdown, connected sites | Owner, Admin, Finance |
| `/clients` | Clients Directory | Client search, active status badges, total billing volume | Owner, Admin, Finance, Support |
| `/clients/[id]` | Client Profile | Client details, associated projects, invoice history, payment log | Owner, Admin, Finance, Support |
| `/projects` | Projects Portfolio | Connected client projects, entitlement status, SDK status | Owner, Admin, Finance, Support |
| `/projects/[id]` | Project Management Hub | Multi-tab hub: Overview, Billing, Licences, Integration, Settings | Owner, Admin, Finance, Support |
| `/analytics` | Global Analytics Dashboard | Aggregated traffic, pageviews, session duration across all sites | Owner, Admin |
| `/analytics/[siteId]` | Project Telemetry Workspace | Daily visitor charts, top pages, engaged time, integration status | Owner, Admin |
| `/analytics/[siteId]/events`| Filterable Events Explorer | Raw privacy-safe event stream, click events, pagination, filtering | Owner, Admin |
| `/invoices` | Invoicing & Milestones | Invoice ledger, due date indicators, payment link generator | Owner, Admin, Finance |
| `/invoices/[id]` | Invoice Details & PDF | Itemized line items, tax breakdown, PDF receipt download | Owner, Admin, Finance |
| `/instalments` | Milestone Instalment Plans | Fixed-term project payment splits, schedule tracking | Owner, Admin, Finance |
| `/subscriptions` | UPI AutoPay Subscriptions | Recurring retainers, mandate status, interval billing | Owner, Admin, Finance |
| `/payments` | Payment Transaction Ledger | Razorpay order IDs, payment method, settlement status | Owner, Admin, Finance |
| `/payments/[id]` | Payment Audit & Receipt | Detailed HMAC verification log, refund actions, audit history | Owner, Admin, Finance |
| `/refunds` | Refunds Management | Refund requests, processing states, audit logs | Owner, Admin, Finance |
| `/integrations` | Integration Monitoring | SDK health, ping latencies, connector versions | Owner, Admin, Support |
| `/integrations/[id]` | Integration Diagnostic | Safe connectivity diagnostics, error codes, domain checks | Owner, Admin, Support |
| `/licences` | Licence Key Manager | Masked licence keys, domains, validity periods, rotation | Owner, Admin |
| `/licences/[id]` | Licence Details & Actions | Rotation, revocation, domain wildcard rules | Owner, Admin |
| `/entitlements` | Remote Entitlement Center | Remote Active/Grace Period/Suspended controls, audit confirmation | Owner, Admin |
| `/audit-logs` | Operational Audit Trail | Immutable system actions, actor IP, timestamp, change diff | Owner, Admin |
| `/settings` | Business Settings | Company info, GSTIN, default currency, payment settings | Owner, Admin |
| `/settings/team` | Team & RBAC Management | Team members, role assignments (Admin, Finance, Support) | Owner |
| `/settings/privacy` | DPDP Act Compliance | Data retention policies, domain allowlists, deletion tools | Owner, Admin |
| `/portal` | Client Portal Dashboard | Client's invoices, payments, instalment schedules, licences | Client, Authenticated User |

---

## 3. Sidebar Information Hierarchy

### Group 1: Overview
- **Dashboard** (`/dashboard` or `/admin`)

### Group 2: Business
- **Clients** (`/clients`)
- **Projects** (`/projects`)
- **Invoices** (`/invoices`)
- **Instalments** (`/instalments`)
- **Subscriptions** (`/subscriptions`)
- **Payments** (`/payments`)
- **Refunds** (`/refunds`)

### Group 3: Insights
- **Website Analytics** (`/analytics`)
- **Events & Conversions** (`/analytics/events`)
- **Integrations** (`/integrations`)

### Group 4: Control
- **Licence Keys** (`/licences`)
- **Entitlements** (`/entitlements`)
- **Audit Logs** (`/audit-logs`)

### Group 5: Administration
- **Settings** (`/settings`)
- **Team & Permissions** (`/settings/team`)
- **Privacy & DPDP** (`/settings/privacy`)
