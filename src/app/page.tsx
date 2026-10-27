import Link from 'next/link';
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
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute top-64 right-10 w-[400px] h-[300px] bg-indigo-600/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-blue-600/30">
              L
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">LostGit Pay</span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-blue-950/80 border border-blue-800/70 text-blue-400 rounded-md">
                Fintech Engine
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white px-3 py-2 transition"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition cursor-pointer"
            >
              <span>Client Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 max-w-5xl mx-auto pt-24 pb-20 px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 mb-8 shadow-inner">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Production Client Invoicing, UPI AutoPay & Licence Enforcement</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
          Modern Financial Rails for{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300">
            LostGit Solutions
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          The unified client billing engine. Collect one-time milestone payments, manage recurring software maintenance retainers with Razorpay AutoPay, and enforce real-time licence entitlements.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition transform hover:-translate-y-0.5"
          >
            <span>Access Client Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="https://lostgit.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-semibold text-sm transition"
          >
            <span>LostGit Solutions</span>
            <ExternalLink className="w-4 h-4 text-slate-500" />
          </a>
        </div>
      </header>

      {/* Feature Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-7 relative overflow-hidden group hover:border-slate-700 transition">
            <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400 mb-5">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Zero-Error Precision</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Strict integer paise architecture for all financial calculations. Guaranteed zero rounding loss across uneven instalment schedules and tax breakdowns.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-7 relative overflow-hidden group hover:border-slate-700 transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400 mb-5">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Razorpay UPI AutoPay</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Automated recurring retainers and maintenance plans. Supports UPI AutoPay, mandate authorization, and webhook-driven payment reconciliation.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-7 relative overflow-hidden group hover:border-slate-700 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 mb-5">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Licence & Entitlement API</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Real-time licence verification SDK for websites and mobile applications. Automatic grace period policy and suspension enforcement for overdue accounts.
            </p>
          </div>
        </div>
      </section>

      {/* Security & Reliability Highlights */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-12">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Enterprise Fintech Security Standard
            </h2>
            <p className="mt-3 text-slate-400 text-sm">
              Engineered with end-to-end cryptographic integrity and strict tenant isolation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">HMAC SHA256 Signature Verification</p>
                <p className="text-xs text-slate-400 mt-1">
                  Every Razorpay checkout payment and incoming webhook is validated with timing-safe comparisons.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">PostgreSQL Row-Level Security</p>
                <p className="text-xs text-slate-400 mt-1">
                  Multi-tenant isolation ensures clients can only access invoices and projects belonging to their business.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Idempotent Webhook Processing</p>
                <p className="text-xs text-slate-400 mt-1">
                  Unique event tracking protects against duplicate payment recordings and network retries.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Comprehensive Audit Logging</p>
                <p className="text-xs text-slate-400 mt-1">
                  Every state transition, invoice payment, refund, and licence check is permanently logged with IP and actor details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} LostGit Solutions. All rights reserved.</p>
        <p className="mt-2">
          LostGit Pay is the proprietary client billing engine of LostGit Solutions.
        </p>
      </footer>
    </div>
  );
}
