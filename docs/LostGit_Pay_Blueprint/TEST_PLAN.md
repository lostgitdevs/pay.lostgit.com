# LostGit Pay — Comprehensive Testing Plan

## 1. Automated Testing Strategy

```
           +-----------------------------+
           |       End-to-End (E2E)      |
           |     Playwright / Cypress    |
           +--------------+--------------+
                          |
           +--------------v--------------+
           |      Integration Tests      |
           |   RLS, Webhooks, Ingestion  |
           +--------------+--------------+
                          |
           +--------------v--------------+
           |         Unit Tests          |
           | Calculations, Sigs, SDK     |
           +-----------------------------+
```

---

## 2. Test Suites

### Suite A: Financial Calculations (`src/test/calculations.test.ts`)
- Paise math precision (integer minor units).
- Zero rounding loss across uneven instalment schedules (e.g., 10,000 paise / 3 instalments -> 3,334 + 3,333 + 3,333 = 10,000).
- GST 18% exact calculation with discount deduplication.
- Balance and status state machine (`paid`, `partially_paid`, `overdue`).

### Suite B: Razorpay Cryptographic Verification (`src/test/razorpay.test.ts`)
- Client checkout HMAC SHA256 signature verification.
- Webhook payload signature verification.
- Rejection of tampered signatures using constant-time comparison (`crypto.timingSafeEqual`).

### Suite C: Software Entitlement & Licences (`src/test/licence.test.ts`)
- Licence key formatting (`LGT-XXXX-XXXX-...`).
- Domain authorization and wildcard matching (`*.company.com`).
- Grace period calculation (default 7 days).

### Suite D: Website Analytics & Ingestion (`src/test/analytics.test.ts`)
- Ingestion payload validation.
- Pseudo-anonymous visitor hashing.
- Duration and bounce calculation.
- Rate limiting and origin filtering.

---

## 3. Execution Commands

```bash
# Run all unit and integration tests
npm test

# Run tests in watch mode
npm run test:watch
```
