# LostGit Pay — Security, Privacy & Entitlement Policy

## 1. Credential Separation & Isolation

LostGit Pay enforces strict separation of privileges:
1. **Public Tracking Keys (`LGT-TRK-...`)**: Safe to embed in browser client scripts. Only allows sending telemetry to `/api/v1/analytics/collect`. Cannot read billing records, query database tables, or alter service states.
2. **Server-Side Licence Keys (`LGT-XXXX-XXXX-...`)**: Configured in client backend environment variables (e.g., `LOSTGIT_LICENCE_KEY`). Used for verifying entitlement and software access.
3. **Privileged API Credentials**: Kept strictly server-side in `.env.local` (`SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`). Never exposed to browser bundles.

---

## 2. Privacy & Compliance (DPDP Act India)

The platform adheres to India's Digital Personal Data Protection (DPDP) Act:
1. **Consent & Notice**: Client websites integrating the analytics SDK are provided sample privacy notices informing end-users about aggregate performance and usage telemetry.
2. **Zero Form Data Capture**: The tracking SDK explicitly ignores `<input>`, `<textarea>`, and `<select>` elements to guarantee form entries, passwords, credit card numbers, and PII are never harvested.
3. **Rotating Daily Salting**: Visitor IDs are hashed daily using a secure rotating salt. Cross-site tracking across unrelated clients is prevented.
4. **Data Retention & Pruning**: Granular click/event records can be automatically aggregated and pruned after 90 days.

---

## 3. Lawful & Transparent Entitlement Enforcement

LostGit Pay provides centralized management for projects built and maintained by LostGit Solutions:
- **Contractual Authority**: Service activation, grace periods, or suspensions are enforced only on contractually defined LostGit-delivered software modules and maintenance contracts.
- **Audit Trail**: Any administrative action changing a project status (`active` -> `suspended` or `active` -> `grace_period`) requires an authenticated staff user ID and logs an immutable entry in `audit_logs`.
- **Automatic Grace Periods**: When an invoice becomes overdue, a configurable grace period (default 7 days) provides business continuity before services transition to a suspended state.
