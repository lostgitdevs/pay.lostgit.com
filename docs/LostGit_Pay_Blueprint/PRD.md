# LostGit Pay — Product Requirements Document (PRD)

## 1. Executive Summary
LostGit Pay is the unified financial operations, client billing, website analytics, and software entitlement management platform for LostGit Solutions.

LostGit develops websites, web applications, and mobile apps for clients. LostGit Pay allows LostGit to:
1. Bill clients with exact integer paise precision for milestones and recurring retainers.
2. Embed an authorized analytics SDK on client websites to track visitor traffic, session duration, click heat-paths, and integration health.
3. Centrally manage software licences and enforce contractually agreed entitlement status (active, grace period, suspended).

---

## 2. User Roles & Personas

| Role | Permissions |
|---|---|
| **Owner / Executive** | Full access to business metrics, billing, payments, analytics, client data, and destructive actions. |
| **Admin** | Full operational access to clients, projects, invoices, analytics, and entitlement controls. |
| **Finance Staff** | Access to invoices, payments, refunds, tax summaries, and financial reports. No licence revocation powers. |
| **Support Staff** | View clients, projects, integration health, and transaction logs. Read-only for financial ledgers. |
| **Client** | Self-service portal to view invoices, make Razorpay payments, download receipts, view project status and licence keys. |

---

## 3. Core Feature Requirements

### Feature 1: Billing & Instalments
- Invoices created with line items, tax percentage (default 18% GST), and discount.
- Integer paise representation prevents rounding errors.
- Milestone instalment plans with schedule generation where `sum(instalments) == total_amount`.
- Public payment links (`/pay/[token]`) with expiration dates.

### Feature 2: Razorpay Payment Gateway
- One-time checkout via Razorpay Orders API.
- Recurring maintenance subscriptions via Razorpay Subscriptions / UPI AutoPay.
- Cryptographic signature verification (`HMAC-SHA256`) with timing-safe comparison.
- Webhook ingestion with idempotency guarantees using `webhook_events`.

### Feature 3: Privacy-Conscious Website Analytics
- Versioned client script (`lostgit-analytics.js`) embeddable with a single `<script>` tag.
- Collects:
  - Page views (pathname, page title, referrer, device type, browser family).
  - Estimated session duration (beacon/heartbeat without heavy polling).
  - Configured click events (buttons, links, `data-track` attributes).
  - Integration health pings & client error reporting.
- Privacy compliance with India's Digital Personal Data Protection (DPDP) Act:
  - No recording of form values, passwords, credit card inputs, or private text.
  - Pseudo-anonymous daily rotating visitor hashes (no permanent cross-site fingerprinting).

### Feature 4: Central Project Entitlement & Health
- Project status toggle: `active`, `grace_period`, `suspended`, `revoked`.
- REST API endpoint (`/api/v1/licence/verify`) queried by client applications.
- Transparent logging: Every activation or suspension action is logged in `audit_logs` with admin identity and timestamp.
