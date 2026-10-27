import Razorpay from 'razorpay';
import crypto from 'crypto';

let razorpayInstance: Razorpay | null = null;

/**
 * Initializes and returns the Razorpay client singleton.
 * Uses environment variables NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.
 */
export function getRazorpayClient(): Razorpay {
  if (razorpayInstance) {
    return razorpayInstance;
  }

  const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error(
      'Razorpay credentials missing. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.'
    );
  }

  razorpayInstance = new Razorpay({
    key_id,
    key_secret,
  });

  return razorpayInstance;
}

/**
 * Creates a Razorpay Order for an invoice or instalment.
 * @param amountPaise Amount in integer paise (e.g. 50000 = 500.00 INR)
 * @param receipt Unique receipt identifier (max 40 chars)
 * @param notes Custom metadata key-value pairs
 */
export async function createRazorpayOrder({
  amountPaise,
  receipt,
  notes = {},
  currency = 'INR',
}: {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
  currency?: string;
}) {
  const client = getRazorpayClient();

  const options = {
    amount: amountPaise,
    currency,
    receipt: receipt.slice(0, 40),
    notes,
  };

  const order = await client.orders.create(options);
  return order;
}

/**
 * Verifies Razorpay payment signature after client-side checkout.
 * Expected: HMAC SHA256 of (order_id + '|' + payment_id) with RAZORPAY_KEY_SECRET
 */
export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new Error('RAZORPAY_KEY_SECRET is not configured');
  }

  const text = `${orderId}|${paymentId}`;
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(text)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(generatedSignature, 'utf-8'),
    Buffer.from(signature, 'utf-8')
  );
}

/**
 * Verifies Razorpay webhook signature from request headers.
 * Header: 'x-razorpay-signature'
 */
export function verifyWebhookSignature({
  rawBody,
  signature,
}: {
  rawBody: string;
  signature: string;
}): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('RAZORPAY_WEBHOOK_SECRET is not configured');
  }

  const generatedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  if (generatedSignature.length !== signature.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(generatedSignature, 'utf-8'),
    Buffer.from(signature, 'utf-8')
  );
}

/**
 * Initiates a full or partial refund via Razorpay API.
 */
export async function createRazorpayRefund({
  paymentId,
  amountPaise,
  notes = {},
}: {
  paymentId: string;
  amountPaise?: number;
  notes?: Record<string, string>;
}) {
  const client = getRazorpayClient();

  const options: { payment_id: string; amount?: number; notes?: Record<string, string> } = {
    payment_id: paymentId,
    notes,
  };

  if (amountPaise && amountPaise > 0) {
    options.amount = amountPaise;
  }

  const refund = await client.payments.refund(paymentId, options);
  return refund;
}
