# LostGit Pay — Architecture & Technical Specifications

**LostGit Pay** is the central client billing, financial operations, and software licence entitlement engine of **LostGit Solutions**.

---

## 1. System Overview

```
                      +-----------------------------+
                      |       Client Browser        |
                      |   (/pay/[token], /portal)   |
                      +--------------+--------------+
                                     |
                                     v
+-----------------------+   +-----------------+   +-------------------------+
|   LostGit Software    |-->|   LostGit Pay   |<--| Razorpay Webhook Engine |
| (Web & Mobile Apps)   |   |   (Next.js 16)  |   |    (HMAC SHA256 Sig)    |
| /api/v1/licence/verify|   +--------+--------+   +-------------------------+
+-----------------------+            |
                                     v
                      +-----------------------------+
                      |   Supabase Postgres & RLS   |
                      |   (Tenant-isolated Tables)  |
                      +-----------------------------+
```

---

## 2. Core Architectural Pillars

### A. Strict Integer Currency Precision (Paise)
- All monetary fields in the database and API payloads are stored in integer minor units (**paise**).
- 1 INR = 100 paise (e.g. ₹1,500.00 is stored as `150000`).
- Eliminates IEEE 754 floating point rounding errors.
- Instalment scheduling calculates base amounts and assigns remainder paise to the initial instalment, guaranteeing `sum(instalments) === total_invoice_amount` with zero discrepancy.

### B. Defense-in-Depth Security
- **HMAC SHA256 Signature Verification**: Both Razorpay client checkout responses and server-to-server webhooks are verified cryptographically using constant-time byte comparisons (`crypto.timingSafeEqual`) to prevent timing attacks.
- **Row Level Security (RLS)**: Enforced directly at the PostgreSQL layer. Client users can only query records linked to their specific `client_id`. Staff and administrators operate with role-based policies.
- **Next.js 16 Proxy (`proxy.ts`)**: Session refresh and edge-level security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`).

### C. Webhook Idempotency
- Every incoming webhook event ID is recorded in the `webhook_events` table before processing.
- Duplicate delivery by payment gateways (retries) returns HTTP 200 immediately without reprocessing financial state.

### D. Software Entitlement & Licence Verification
- Project deployments query `GET /api/v1/licence/verify?key=...&domain=...` or use the `@lostgit/pay-sdk`.
- Automated grace period enforcement (default 7 days) allows business continuity during banking delays while ensuring overdue accounts transition to suspension.

---

## 3. Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router + Proxy) |
| Language | TypeScript 5 (Strict) |
| Database | Supabase (PostgreSQL 15+) |
| Security | Row Level Security (RLS) + Web Crypto |
| Payment Gateway | Razorpay (Orders, Subscriptions, UPI AutoPay, Webhooks) |
| Testing | Vitest + React Testing Library + JSDOM |
| Styling | Tailwind CSS 4 + Modern Theme Tokens |
