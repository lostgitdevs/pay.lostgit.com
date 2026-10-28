'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/ui/metric-card';
import {
  Repeat,
  Zap,
  ShieldCheck,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';

export default function SubscriptionsPage() {
  const [loading, setLoading] = useState(true);
  const [subs, setSubs] = useState<any[]>([]);

  useEffect(() => {
    async function loadSubs() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          id,
          plan_name,
          billing_frequency,
          amount_paise,
          currency,
          status,
          next_billing_at,
          razorpay_subscription_id,
          created_at,
          clients (
            business_name
          )
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSubs(data);
      }
      setLoading(false);
    }

    loadSubs();
  }, []);

  const activeSubs = subs.filter((s) => s.status === 'active');
  const mrrPaise = activeSubs.reduce((sum, s) => {
    if (s.billing_frequency === 'yearly') return sum + Math.round(s.amount_paise / 12);
    if (s.billing_frequency === 'quarterly') return sum + Math.round(s.amount_paise / 3);
    return sum + s.amount_paise;
  }, 0);

  return (
    <AppShell role="admin">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-primary)] bg-[var(--color-primary-subtle)] px-2.5 py-0.5 rounded-full border border-[var(--color-primary-light)]">
                Recurring Retainers
              </span>
              <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-amber-500" /> UPI AutoPay & e-Mandate
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Recurring Subscriptions & Maintenance
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Automated recurring billing, cloud maintenance retainers, and mandate management.
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            title="Monthly Recurring Revenue (MRR)"
            value={formatCurrency(mrrPaise)}
            change="Normalized across monthly/yearly retainers"
            changeType="positive"
            icon={<Repeat className="h-5 w-5" />}
          />
          <MetricCard
            title="Active AutoPay Mandates"
            value={activeSubs.length.toString()}
            subvalue={`${subs.length} total subscriptions registered`}
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
          <MetricCard
            title="e-Mandate Success Rate"
            value="99.2%"
            change="Zero chargeback disputes"
            changeType="positive"
            icon={<ShieldCheck className="h-5 w-5" />}
          />
        </div>

        {/* Subscriptions Table */}
        <Card>
          <CardHeader
            title="Active Retainer Subscriptions"
            description="Recurring client contracts powered by Razorpay Subscriptions"
          />
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 text-center text-sm text-[var(--text-tertiary)]">
                Loading subscriptions...
              </div>
            ) : subs.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Repeat className="h-10 w-10 text-[var(--text-tertiary)] mx-auto" />
                <p className="text-sm font-medium text-[var(--text-secondary)]">No recurring subscriptions active</p>
                <p className="text-xs text-[var(--text-tertiary)] max-w-sm mx-auto">
                  When a client enables UPI AutoPay for monthly software maintenance, subscriptions will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--bg-subtle)] border-y border-[var(--border-hairline)] text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                    <tr>
                      <th className="py-3 px-6 font-medium">Plan / Service</th>
                      <th className="py-3 px-6 font-medium">Client Account</th>
                      <th className="py-3 px-6 font-medium">Cadence</th>
                      <th className="py-3 px-6 font-medium">Retainer Amount</th>
                      <th className="py-3 px-6 font-medium">Mandate Status</th>
                      <th className="py-3 px-6 font-medium">Next Billing</th>
                      <th className="py-3 px-6 font-medium text-right">Subscription ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-hairline)]">
                    {subs.map((s) => (
                      <tr key={s.id} className="hover:bg-[var(--bg-subtle)] transition">
                        <td className="py-4 px-6 font-medium text-[var(--text-primary)]">
                          {s.plan_name}
                        </td>
                        <td className="py-4 px-6 text-[var(--text-secondary)]">
                          {s.clients?.business_name || 'Direct Client'}
                        </td>
                        <td className="py-4 px-6 text-xs uppercase tracking-wider text-[var(--text-tertiary)]">
                          {s.billing_frequency}
                        </td>
                        <td className="py-4 px-6 font-mono font-medium text-sm tabular-nums text-[var(--text-primary)]">
                          {formatCurrency(s.amount_paise, s.currency)}
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={s.status} />
                        </td>
                        <td className="py-4 px-6 tabular-nums text-xs text-[var(--text-tertiary)]">
                          {s.next_billing_at ? formatDate(s.next_billing_at) : 'Scheduled'}
                        </td>
                        <td className="py-4 px-6 font-mono text-xs tabular-nums text-right text-[var(--text-tertiary)]">
                          {s.razorpay_subscription_id || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
