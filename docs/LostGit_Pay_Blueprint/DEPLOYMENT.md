# LostGit Pay — Production Deployment Blueprint

## 1. Domain & DNS Configuration (Namecheap)

Target Domain: `pay.lostgit.com`

| Type | Host | Value | TTL |
|---|---|---|---|
| CNAME | `pay` | `cname.vercel-dns.com.` | Automatic (30 min) |

---

## 2. Supabase Cloud Configuration

- **Database Host**: `https://mvhqtuhgjwuokouyfdlb.supabase.co`
- Execute migrations sequentially in the SQL Editor:
  1. `20261028000000_init_schema.sql` (Billing & Auth)
  2. `20261028000001_rls_policies.sql` (Row Level Security)
  3. `20261028000002_owner_bootstrap.sql` (Auth Triggers)
  4. `20261028000003_analytics_schema.sql` (Analytics & Telemetry)

---

## 3. Environment Variables (Vercel Production)

```env
NEXT_PUBLIC_APP_URL=https://pay.lostgit.com
NEXT_PUBLIC_APP_NAME="LostGit Pay"

NEXT_PUBLIC_SUPABASE_URL=https://mvhqtuhgjwuokouyfdlb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SECRET_KEY=sb_secret_...


NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

RESEND_API_KEY=re_...
EMAIL_FROM_ADDRESS=billing@pay.lostgit.com

CRON_SECRET=...
APP_ENCRYPTION_KEY=...
BOOTSTRAP_OWNER_EMAIL=th3karn.dev@gmail.com
```

---

## 4. Verification Checkpoints

```bash
# Verify TypeScript strict compilation
npx tsc --noEmit

# Run test suite
npm test

# Verify production build
npm run build
```
