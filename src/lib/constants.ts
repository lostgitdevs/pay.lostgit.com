/**
 * Application-wide constants.
 * All monetary values are in paise (integer minor units).
 */

// ----- Roles -----
export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  FINANCE: 'finance',
  SUPPORT: 'support',
  CLIENT: 'client',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const STAFF_ROLES: Role[] = [ROLES.OWNER, ROLES.ADMIN, ROLES.FINANCE, ROLES.SUPPORT];
export const ADMIN_ROLES: Role[] = [ROLES.OWNER, ROLES.ADMIN];

// ----- Invoice Status -----
export const INVOICE_STATUS = {
  DRAFT: 'draft',
  ISSUED: 'issued',
  SENT: 'sent',
  PARTIALLY_PAID: 'partially_paid',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  VOID: 'void',
} as const;

export type InvoiceStatus = (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS];

// ----- Payment Status -----
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  AUTHORIZED: 'authorized',
  CAPTURED: 'captured',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

// ----- Payment Attempt Status -----
export const PAYMENT_ATTEMPT_STATUS = {
  CREATED: 'created',
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  EXPIRED: 'expired',
} as const;

export type PaymentAttemptStatus = (typeof PAYMENT_ATTEMPT_STATUS)[keyof typeof PAYMENT_ATTEMPT_STATUS];

// ----- Instalment Status -----
export const INSTALMENT_STATUS = {
  SCHEDULED: 'scheduled',
  DUE: 'due',
  PAID: 'paid',
  PARTIALLY_PAID: 'partially_paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
} as const;

export type InstalmentStatus = (typeof INSTALMENT_STATUS)[keyof typeof INSTALMENT_STATUS];

// ----- Payment Plan Status -----
export const PAYMENT_PLAN_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DEFAULTED: 'defaulted',
} as const;

export type PaymentPlanStatus = (typeof PAYMENT_PLAN_STATUS)[keyof typeof PAYMENT_PLAN_STATUS];

// ----- Subscription Status -----
export const SUBSCRIPTION_STATUS = {
  CREATED: 'created',
  AUTHENTICATED: 'authenticated',
  ACTIVE: 'active',
  PENDING: 'pending',
  HALTED: 'halted',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
} as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

// ----- Project Status -----
export const PROJECT_STATUS = {
  PROPOSAL: 'proposal',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];

// ----- Client Status -----
export const CLIENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  INVITED: 'invited',
} as const;

export type ClientStatus = (typeof CLIENT_STATUS)[keyof typeof CLIENT_STATUS];

// ----- Entitlement Status -----
export const ENTITLEMENT_STATUS = {
  ACTIVE: 'active',
  GRACE_PERIOD: 'grace_period',
  PENDING_REVIEW: 'pending_review',
  SUSPENDED: 'suspended',
  RESTORED: 'restored',
  EXPIRED: 'expired',
  REVOKED: 'revoked',
} as const;

export type EntitlementStatus = (typeof ENTITLEMENT_STATUS)[keyof typeof ENTITLEMENT_STATUS];

// ----- Refund Status -----
export const REFUND_STATUS = {
  INITIATED: 'initiated',
  PROCESSING: 'processing',
  PROCESSED: 'processed',
  FAILED: 'failed',
} as const;

export type RefundStatus = (typeof REFUND_STATUS)[keyof typeof REFUND_STATUS];

// ----- Webhook Processing Status -----
export const WEBHOOK_PROCESSING_STATUS = {
  RECEIVED: 'received',
  PROCESSING: 'processing',
  PROCESSED: 'processed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
} as const;

export type WebhookProcessingStatus = (typeof WEBHOOK_PROCESSING_STATUS)[keyof typeof WEBHOOK_PROCESSING_STATUS];

// ----- Licence Status -----
export const LICENCE_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  REVOKED: 'revoked',
  ROTATED: 'rotated',
} as const;

export type LicenceStatus = (typeof LICENCE_STATUS)[keyof typeof LICENCE_STATUS];

// ----- Invoice Types -----
export const INVOICE_TYPE = {
  ONE_TIME: 'one_time',
  INSTALMENT: 'instalment',
  SUBSCRIPTION: 'subscription',
  CREDIT_NOTE: 'credit_note',
} as const;

export type InvoiceType = (typeof INVOICE_TYPE)[keyof typeof INVOICE_TYPE];

// ----- Project Types -----
export const PROJECT_TYPE = {
  WEBSITE: 'website',
  WEB_APP: 'web_app',
  MOBILE_APP: 'mobile_app',
  SOFTWARE: 'software',
  MAINTENANCE: 'maintenance',
  OTHER: 'other',
} as const;

export type ProjectType = (typeof PROJECT_TYPE)[keyof typeof PROJECT_TYPE];

// ----- Defaults -----
export const DEFAULT_CURRENCY = 'INR';
export const DEFAULT_TIMEZONE = 'Asia/Kolkata';
export const DEFAULT_LOCALE = 'en-IN';
export const DEFAULT_GRACE_PERIOD_DAYS = 7;
export const DEFAULT_PAYMENT_TERMS_DAYS = 15;
export const PAYMENT_LINK_EXPIRY_HOURS = 72;
export const MAX_PAYMENT_RETRY_ATTEMPTS = 3;
export const INVOICE_NUMBER_PREFIX = 'INV';
export const RECEIPT_NUMBER_PREFIX = 'RCT';

// ----- Razorpay Event Types -----
export const RAZORPAY_EVENTS = {
  PAYMENT_AUTHORIZED: 'payment.authorized',
  PAYMENT_CAPTURED: 'payment.captured',
  PAYMENT_FAILED: 'payment.failed',
  ORDER_PAID: 'order.paid',
  REFUND_CREATED: 'refund.created',
  REFUND_PROCESSED: 'refund.processed',
  REFUND_FAILED: 'refund.failed',
  SUBSCRIPTION_AUTHENTICATED: 'subscription.authenticated',
  SUBSCRIPTION_ACTIVATED: 'subscription.activated',
  SUBSCRIPTION_CHARGED: 'subscription.charged',
  SUBSCRIPTION_PENDING: 'subscription.pending',
  SUBSCRIPTION_HALTED: 'subscription.halted',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
  SUBSCRIPTION_PAUSED: 'subscription.paused',
  SUBSCRIPTION_RESUMED: 'subscription.resumed',
  SUBSCRIPTION_COMPLETED: 'subscription.completed',
} as const;

export type RazorpayEvent = (typeof RAZORPAY_EVENTS)[keyof typeof RAZORPAY_EVENTS];
