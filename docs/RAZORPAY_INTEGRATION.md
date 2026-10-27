# LostGit Pay — Razorpay Integration Guide

This guide details the integration with Razorpay for one-time milestone invoices and recurring subscriptions.

---

## 1. Environment Configuration

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

---

## 2. One-Time Payments Architecture

```
Client (/pay/[token]) -> POST /api/pay/[token]/order -> Razorpay Orders API
                                                             |
Client Razorpay Checkout Modal <-----------------------------+
      |
      v
Client finishes payment (UPI/Card/NetBanking)
      |
      v
POST /api/pay/[token]/verify -> Server verifies HMAC SHA256 -> Marks Paid
```

### Signature Verification Formula
```ts
const text = `${orderId}|${paymentId}`;
const generatedSignature = crypto
  .createHmac('sha256', secret)
  .update(text)
  .digest('hex');

crypto.timingSafeEqual(Buffer.from(generatedSignature), Buffer.from(signature));
```

---

## 3. Webhook Handling

Endpoint: `POST /api/webhooks/razorpay`

Header: `x-razorpay-signature`

### Supported Events
1. `payment.captured` / `order.paid`: Updates invoice balance to `paid` or `partially_paid`, creates payment record and receipt.
2. `payment.failed`: Records failed attempt with error code and description.
3. `subscription.activated` / `subscription.charged`: Sets subscription status to `active` and extends validity dates.
4. `subscription.halted` / `subscription.cancelled`: Sets subscription status to `halted` or `cancelled`.

### Idempotency Protection
Before processing any webhook event, `webhook_events` is queried by `event_id`. If the event status is already `processed`, an HTTP 200 is returned immediately.
