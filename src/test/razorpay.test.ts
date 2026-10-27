import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';
import { verifyPaymentSignature, verifyWebhookSignature } from '../lib/razorpay';

describe('Razorpay Signature Verification', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      RAZORPAY_KEY_SECRET: 'test_secret_key_12345',
      RAZORPAY_WEBHOOK_SECRET: 'test_webhook_secret_67890',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('verifyPaymentSignature', () => {
    it('verifies a valid payment signature', () => {
      const orderId = 'order_test_98765';
      const paymentId = 'pay_test_43210';
      const secret = 'test_secret_key_12345';

      const validSignature = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const isValid = verifyPaymentSignature({
        orderId,
        paymentId,
        signature: validSignature,
      });

      expect(isValid).toBe(true);
    });

    it('rejects a forged or tampered payment signature', () => {
      const orderId = 'order_test_98765';
      const paymentId = 'pay_test_43210';
      const fakeSignature = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

      const isValid = verifyPaymentSignature({
        orderId,
        paymentId,
        signature: fakeSignature,
      });

      expect(isValid).toBe(false);
    });
  });

  describe('verifyWebhookSignature', () => {
    it('verifies a valid webhook payload signature', () => {
      const rawBody = JSON.stringify({
        event: 'payment.captured',
        payload: { payment: { id: 'pay_test_123' } },
      });
      const secret = 'test_webhook_secret_67890';

      const validSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

      const isValid = verifyWebhookSignature({
        rawBody,
        signature: validSignature,
      });

      expect(isValid).toBe(true);
    });

    it('rejects an invalid webhook signature or modified payload', () => {
      const rawBody = JSON.stringify({ event: 'payment.captured' });
      const tamperedBody = JSON.stringify({ event: 'payment.failed' });
      const secret = 'test_webhook_secret_67890';

      const originalSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

      const isValid = verifyWebhookSignature({
        rawBody: tamperedBody,
        signature: originalSignature,
      });

      expect(isValid).toBe(false);
    });
  });
});
