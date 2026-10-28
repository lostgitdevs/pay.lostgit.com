# LostGit Pay Blueprint — Master Index

**LostGit Pay** (`https://pay.lostgit.com`) is an enterprise platform combining:
1. **Client Billing & Invoicing**: Paise-precision calculations, milestone instalments, and recurring maintenance retainers.
2. **Fintech Payment Rails**: Razorpay Orders, Subscriptions, UPI AutoPay, and cryptographic signature verification.
3. **Website Analytics & Telemetry**: Privacy-conscious tracking SDK measuring page views, sessions, duration, click interactions, referrers, and conversions.
4. **Project Entitlement & Remote Lifecycle**: Contractually authorized service activation, grace periods, suspension, and restoration.

---

## Blueprint Document Index

| Document | Purpose |
|---|---|
| [`PRD.md`](./PRD.md) | Product Requirements Document, user roles, feature specifications, and acceptance criteria |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Technical architecture, trust boundaries, network flows, and component interactions |
| [`ANALYTICS_SPEC.md`](./ANALYTICS_SPEC.md) | Browser Tracking SDK, event schema, session duration calculation, and privacy standards |
| [`DATABASE.md`](./DATABASE.md) | PostgreSQL schema, tables, foreign keys, indexes, and Row Level Security (RLS) policies |
| [`API_SPEC.md`](./API_SPEC.md) | REST API endpoints for analytics ingestion, entitlement verification, and billing |
| [`SECURITY.md`](./SECURITY.md) | Credential separation, DPDP Act privacy compliance, HMAC verification, and threat model |
| [`DEPLOYMENT.md`](./DEPLOYMENT.md) | Production setup on Vercel, Supabase, Namecheap DNS, and environment checklist |
| [`TEST_PLAN.md`](./TEST_PLAN.md) | Automated testing strategy: unit, integration, tenant-isolation, and negative tests |
| [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) | Phased rollout plan, milestone gates, and verification checklists |
| [`MASTER_PROMPT.md`](./MASTER_PROMPT.md) | Complete executive prompt for implementation engineering |
