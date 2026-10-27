# LostGit Pay — Production Deployment Guide

This guide describes how to deploy **LostGit Pay** to production on **Vercel** with a **Supabase** backend and **Razorpay** payment gateway.

---

## 1. Prerequisites

1. **Supabase Project**: Created in region `ap-south-1` (Mumbai) or nearest to users.
2. **Razorpay Account**: Verified merchant account with UPI AutoPay enabled.
3. **Domain & DNS**: `pay.lostgit.com` configured on Vercel.

---

## 2. Supabase Setup

1. In Supabase Dashboard, open SQL Editor.
2. Execute the migrations in sequence:
   - `supabase/migrations/20261028000000_init_schema.sql`
   - `supabase/migrations/20261028000001_rls_policies.sql`
   - `supabase/migrations/20261028000002_owner_bootstrap.sql`
3. Verify RLS is enabled on all tables in Table Editor.

---

## 3. Environment Variables (Vercel)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://pay.lostgit.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Anon Key for browser client |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret Service Role Key (Server only) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay Key ID (`rzp_live_...` or `rzp_test_...`) |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook Secret configured in Razorpay dashboard |
| `RESEND_API_KEY` | Resend API Key for transactional emails |
| `EMAIL_FROM` | `LostGit Pay <billing@lostgit.com>` |

---

## 4. Razorpay Webhook Configuration

1. In Razorpay Dashboard -> Settings -> Webhooks -> Add New Webhook.
2. Webhook URL: `https://pay.lostgit.com/api/webhooks/razorpay`
3. Secret: Enter a strong random secret and copy it into `RAZORPAY_WEBHOOK_SECRET`.
4. Select active events:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
   - `subscription.activated`
   - `subscription.charged`
   - `subscription.halted`
   - `subscription.cancelled`
   - `refund.processed`
5. Save Webhook.

---

## 5. Verification Commands

```bash
# Verify TypeScript strict compilation
npx tsc --noEmit

# Run automated unit and integration tests
npm test

# Build production bundle
npm run build
```
