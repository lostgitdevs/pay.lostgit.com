# LostGit Pay — Phased Implementation Plan

## Phase 1: Foundations & Architecture
- [x] Repository audit and framework setup (Next.js 16, TypeScript strict)
- [x] Tailwind CSS design system and theme tokens
- [x] Environment validation module (`src/lib/env.ts`)
- [x] Vitest test runner configuration and setup

## Phase 2: Database Schema & Row Level Security
- [x] Base schema migration (`supabase/migrations/20261028000000_init_schema.sql`)
- [x] RLS policies for tenant isolation (`supabase/migrations/20261028000001_rls_policies.sql`)
- [x] Owner bootstrap trigger (`supabase/migrations/20261028000002_owner_bootstrap.sql`)
- [x] TypeScript database definitions (`src/types/database.ts`)

## Phase 3: Financial Precision & Calculations
- [x] Integer paise math engine (`src/lib/calculations.ts`)
- [x] Exact instalment schedule generator without rounding loss
- [x] Calculations test suite (`src/test/calculations.test.ts`)

## Phase 4: Razorpay Payments & Webhooks
- [x] Checkout order creation API (`/api/pay/[token]/order`)
- [x] Server-side signature verification (`/api/pay/[token]/verify`)
- [x] Idempotent webhook receiver (`/api/webhooks/razorpay`)
- [x] Cryptographic verification tests (`src/test/razorpay.test.ts`)

## Phase 5: Software Entitlement & Licences
- [x] Licence key generator and domain matcher (`src/lib/licence.ts`)
- [x] REST verification endpoint (`/api/v1/licence/verify`)
- [x] Client SDK (`src/sdk/lostgit-pay-sdk.ts`)
- [x] Licence test suite (`src/test/licence.test.ts`)

## Phase 6: Privacy-Conscious Website Analytics
- [x] Analytics schema migration (`supabase/migrations/20261028000003_analytics_schema.sql`)
- [x] Browser Tracking SDK (`public/sdk/lostgit-analytics.js`)
- [x] Telemetry ingestion endpoint (`/api/v1/analytics/collect`)
- [x] Health ping endpoint (`/api/v1/analytics/ping`)
- [x] Analytics dashboard queries and charts

## Phase 7: User Portals & Administrative Controls
- [x] Landing page (`src/app/page.tsx`)
- [x] Checkout portal (`src/app/pay/[token]/page.tsx`)
- [x] Client dashboard (`src/app/portal/page.tsx`)
- [x] Admin console (`src/app/admin/page.tsx`)
