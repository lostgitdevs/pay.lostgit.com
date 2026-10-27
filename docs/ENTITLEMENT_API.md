# LostGit Pay — Licence & Entitlement Verification API

Client websites, SaaS applications, and software products built by **LostGit Solutions** can verify their licence and payment entitlement status in real time.

---

## 1. REST Verification Endpoint

### `POST /api/v1/licence/verify`

**Request Body:**
```json
{
  "licenceKey": "LGT-A8F2-99CD-E104-762B",
  "domain": "portal.clientcompany.com"
}
```

**Response (200 OK):**
```json
{
  "valid": true,
  "status": "active",
  "projectName": "Enterprise CRM Portal",
  "clientName": "Acme Technologies Pvt Ltd",
  "allowedDomains": ["*.clientcompany.com", "localhost"],
  "validUntil": "2027-01-01T00:00:00.000Z",
  "gracePeriodUntil": "2027-01-08T00:00:00.000Z",
  "message": "Licence is active and valid."
}
```

### `GET /api/v1/licence/verify?key=LGT-...&domain=...`
Equivalent to the POST endpoint for quick health-checks or middleware integrations.

---

## 2. Entitlement Status Lifecycle

```
[active] --(expiry reached)--> [grace_period] --(grace period elapsed)--> [suspended]
   |                                                                          |
   +----------------------(administrative action)-----------------------------+
   v
[revoked]
```

- **`active`**: Account is in good standing. All software features operate normally.
- **`grace_period`**: Payment is overdue, but within the default 7-day grace window. Software continues to operate; non-blocking warning may be shown to administrators.
- **`suspended`**: Grace period elapsed without payment reconciliation. Software access is blocked until payment is confirmed.
- **`revoked`**: Licence was permanently cancelled or terminated.

---

## 3. TypeScript SDK Usage

```typescript
import { LostGitPayClient } from '@/sdk/lostgit-pay-sdk';

const payClient = new LostGitPayClient({
  licenceKey: process.env.LOSTGIT_LICENCE_KEY!,
  endpoint: 'https://pay.lostgit.com',
  domain: 'portal.clientcompany.com',
  cacheTtlMs: 3600000, // 1 hour memory cache
});

const entitlement = await payClient.verifyEntitlement();
if (!entitlement.valid) {
  console.warn(`Software entitlement status: ${entitlement.status}`);
}
```
