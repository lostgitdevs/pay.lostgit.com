import { z } from 'zod';

/**
 * Server-side environment variables — never exposed to the browser.
 * Validated at service initialization time.
 */
const serverEnvSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  // Razorpay
  RAZORPAY_KEY_ID: z.string().min(1, 'RAZORPAY_KEY_ID is required'),
  RAZORPAY_KEY_SECRET: z.string().min(1, 'RAZORPAY_KEY_SECRET is required'),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1, 'RAZORPAY_WEBHOOK_SECRET is required'),

  // Email
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
  EMAIL_FROM_ADDRESS: z.string().email('EMAIL_FROM_ADDRESS must be a valid email'),

  // Cron
  CRON_SECRET: z.string().min(32, 'CRON_SECRET must be at least 32 characters'),

  // Security
  APP_ENCRYPTION_KEY: z.string().min(32, 'APP_ENCRYPTION_KEY must be at least 32 characters'),

  // Bootstrap
  BOOTSTRAP_OWNER_EMAIL: z.string().email('BOOTSTRAP_OWNER_EMAIL must be a valid email'),
});

/**
 * Client-side environment variables — safe to expose in the browser.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
  NEXT_PUBLIC_APP_NAME: z.string().default('LostGit Pay'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().min(1, 'NEXT_PUBLIC_RAZORPAY_KEY_ID is required'),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * Validates and returns server-side environment variables.
 * Call this in server-side code only (route handlers, server components, services).
 * Throws a descriptive error if any required variable is missing or invalid.
 */
export function getServerEnv(): ServerEnv {
  const result = serverEnvSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const missing = Object.entries(errors)
      .map(([key, msgs]) => `  ${key}: ${msgs?.join(', ')}`)
      .join('\n');

    throw new Error(
      `❌ Server environment validation failed:\n${missing}\n\n` +
      `Copy .env.example to .env.local and provide all required values.`
    );
  }

  return result.data;
}

/**
 * Validates and returns client-side environment variables.
 * Safe to use in client components — only NEXT_PUBLIC_ prefixed values.
 */
export function getClientEnv(): ClientEnv {
  const result = clientEnvSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  });

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const missing = Object.entries(errors)
      .map(([key, msgs]) => `  ${key}: ${msgs?.join(', ')}`)
      .join('\n');

    throw new Error(
      `❌ Client environment validation failed:\n${missing}\n\n` +
      `Ensure all NEXT_PUBLIC_ variables are set in .env.local`
    );
  }

  return result.data;
}

/**
 * Validates a single server env var without throwing.
 * Returns the value if present and valid, or null.
 * Useful for optional service checks (e.g., "is Razorpay configured?").
 */
export function getOptionalServerEnv(key: keyof ServerEnv): string | null {
  const val = process.env[key];
  if (!val || val.startsWith('your-') || val.startsWith('rzp_test_xxxx')) {
    return null;
  }
  return val;
}
