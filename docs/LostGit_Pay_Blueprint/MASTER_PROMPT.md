# Master Engineering Prompt — LostGit Pay

Act as the principal software architect, senior full-stack engineer, analytics engineer, payment integration specialist, security engineer, privacy engineer, QA lead, and DevOps engineer.

Build **LostGit Pay**, hosted at `https://pay.lostgit.com`, for LostGit Solutions.

## Core Capabilities
1. **Billing**: Clients, projects, invoices, fixed-term instalments, ongoing maintenance subscriptions, receipts, refunds, and financial reporting.
2. **Payments**: Razorpay Orders, Payments, Subscriptions, and supported UPI AutoPay workflows, with explicit customer authorisation, verified webhooks, idempotency, and reconciliation.
3. **Website Analytics**: A versioned browser SDK that records permitted page views, sessions, estimated engagement time, configured clicks, referrer sources, conversions, and safe SDK errors.
4. **Analytics Dashboard**: Visitors, sessions, popular pages, engagement, traffic sources, click events, conversions, date filters, exports, and data freshness.
5. **Integration Monitoring**: Project integration status, last successful check, latency, SDK version, and safe error diagnostics.
6. **Project Licences**: Project-specific keys with activation, verification, rotation, expiration, and revocation.
7. **Entitlement Management**: Explicit service states, notices, grace periods, disputes, suspension and restoration, and audit history.
8. **Admin and Client Portals**: Role-based access, strict tenant isolation, secure settings, notifications, and audit logs.

## Engineering Stack
- Framework: Next.js 16 (App Router + Proxy)
- Language: TypeScript 5 (Strict mode)
- Database: Supabase PostgreSQL with strict Row Level Security (RLS)
- Payments: Razorpay API
- Testing: Vitest + React Testing Library + JSDOM
- Styling: Tailwind CSS
