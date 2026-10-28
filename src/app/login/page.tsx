'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        throw signInError;
      }

      // Query user's profile to route to admin or client portal
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profile && ['owner', 'admin', 'finance', 'support'].includes(profile.role)) {
        router.push('/admin');
      } else {
        router.push('/portal');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-[var(--color-primary)] selection:text-white">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[var(--color-primary)]/10 blur-[130px] pointer-events-none rounded-full" />

      {/* Top Controls */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="h-9 w-9 rounded-xl bg-[var(--color-primary)] flex items-center justify-center font-black text-white text-lg shadow-sm">
            L
          </div>
          <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">LostGit Pay</span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
          Sign In to LostGit Pay
        </h2>
        <p className="mt-2 text-xs text-[var(--text-secondary)]">
          Secure financial command for client billing, analytics, and entitlements
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-[var(--surface-1)] border border-[var(--border-hairline)] py-8 px-6 sm:px-10 rounded-2xl shadow-sm">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1"
              >
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                isLoading={loading}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Authenticate Session
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--border-hairline)] flex items-center justify-center gap-1.5 text-xs text-[var(--text-tertiary)]">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Encrypted Supabase Auth &bull; Non-custodial</span>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-[var(--text-tertiary)]">
          <Link href="/" className="hover:text-[var(--text-primary)] transition">
            &larr; Return to LostGit Pay
          </Link>
        </div>
      </div>
    </div>
  );
}
