'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  CreditCard,
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight,
  Code2,
  CheckCircle2,
  Lock,
  BarChart3,
  ExternalLink,
  Receipt,
  Key,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] selection:bg-[var(--color-primary)] selection:text-white">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[var(--color-primary)]/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-[var(--border-hairline)] bg-[var(--surface-1)]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center font-black text-white text-base shadow-sm">
              L
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-[var(--text-primary)]">LostGit Pay</span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-[var(--color-primary-subtle)] border border-[var(--color-primary-light)] text-[var(--color-primary)] rounded-full">
                Fintech Engine
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 transition"
            >
              Sign In
            </Link>
            <Link href="/portal">
              <Button variant="primary" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                Client Portal
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 max-w-5xl mx-auto pt-24 pb-20 px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface-1)] border border-[var(--border-hairline)] text-xs text-[var(--text-secondary)] mb-8 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Milestone Invoicing, UPI AutoPay Retainers & Licence Entitlements</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.1]">
          Precision Financial Control for{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] via-purple-400 to-indigo-400">
            LostGit Solutions
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
          The unified developer-grade financial SaaS. Collect milestone payments in integer paise precision, automate software maintenance retainers with UPI AutoPay, and enforce runtime entitlements remotely.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/login">
            <Button variant="primary" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
              Open Command Center
            </Button>
          </Link>
          <a
            href="https://lostgit.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg" icon={<ExternalLink className="w-4 h-4" />}>
              LostGit Solutions
            </Button>
          </a>
        </div>
      </header>

      {/* Feature Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[var(--border-hairline)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-[var(--surface-1)] border border-[var(--border-hairline)] rounded-2xl p-7 hover:border-[var(--color-primary-light)] transition">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-subtle)] border border-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)] mb-5">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
              Milestone Invoicing & GST
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Generate itemized tax invoices with Indian GST (CGST/SGST/IGST) calculations. Share instant checkout links with clients supporting UPI, Cards, and NetBanking.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-[var(--surface-1)] border border-[var(--border-hairline)] rounded-2xl p-7 hover:border-[var(--color-primary-light)] transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-5">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
              UPI AutoPay Retainers
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Automate monthly and quarterly cloud maintenance contracts using Razorpay Subscriptions and e-Mandate protocols with zero chargeback disputes.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-[var(--surface-1)] border border-[var(--border-hairline)] rounded-2xl p-7 hover:border-[var(--color-primary-light)] transition">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 mb-5">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
              Remote Entitlement Killswitch
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Cryptographically enforce runtime licence boundaries and origin domain allowlists. Remotely toggle active, grace period, or suspended states.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-hairline)] py-12 px-4 sm:px-6 lg:px-8 text-center text-xs text-[var(--text-tertiary)]">
        <p>© 2026 LostGit Solutions. All rights reserved.</p>
        <p className="mt-1">
          Part of the LostGit Solutions brand ecosystem &bull; Bengaluru, India
        </p>
      </footer>
    </div>
  );
}
