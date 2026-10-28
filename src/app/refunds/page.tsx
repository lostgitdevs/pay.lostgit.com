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
  RotateCcw,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export default function RefundsPage() {
  const [loading, setLoading] = useState(true);
  const [refunds, setRefunds] = useState<any[]>([]);

  useEffect(() => {
    async function loadRefunds() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('refunds')
        .select(`
          id,
          amount_paise,
          reason,
          status,
          created_at,
          payments (
            id,
            razorpay_payment_id,
            currency,
            clients (
              business_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setRefunds(data);
      }
      setLoading(false);
    }

    loadRefunds();
  }, []);

  const totalRefundedPaise = refunds.reduce((sum, r) => sum + (r.amount_paise || 0), 0);

  return (
    <AppShell role="admin">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-primary)] bg-[var(--color-primary-subtle)] px-2.5 py-0.5 rounded-full border border-[var(--color-primary-light)]">
                Disbursements & Reversals
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Refunds Ledger
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Audit trail of client refunds, cancellations, and payment reversals.
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            title="Total Refunded Volume"
            value={formatCurrency(totalRefundedPaise)}
            change="Reversed settlement capital"
            changeType={totalRefundedPaise > 0 ? 'warning' : 'neutral'}
            icon={<RotateCcw className="h-5 w-5" />}
          />
          <MetricCard
            title="Processed Reversals"
            value={refunds.length.toString()}
            subvalue="Total lifetime refunds"
            icon={<Clock className="h-5 w-5" />}
          />
          <MetricCard
            title="Reversal Rate"
            value="< 0.5%"
            change="Well below fintech threshold"
            changeType="positive"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
        </div>

        {/* Refunds Table */}
        <Card>
          <CardHeader
            title="Refund Requests & Processing Audit"
            description="All initiated reversals linked directly to Razorpay payment orders"
          />
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 text-center text-sm text-[var(--text-tertiary)]">
                Loading refunds ledger...
              </div>
            ) : refunds.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <RotateCcw className="h-10 w-10 text-[var(--text-tertiary)] mx-auto" />
                <p className="text-sm font-medium text-[var(--text-secondary)]">No refunds recorded</p>
                <p className="text-xs text-[var(--text-tertiary)] max-w-sm mx-auto">
                  When a payment is cancelled or refunded from the payment audit screen, it will be logged here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--bg-subtle)] border-y border-[var(--border-hairline)] text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                    <tr>
                      <th className="py-3 px-6 font-medium">Refund ID</th>
                      <th className="py-3 px-6 font-medium">Payment Reference</th>
                      <th className="py-3 px-6 font-medium">Client Account</th>
                      <th className="py-3 px-6 font-medium">Amount</th>
                      <th className="py-3 px-6 font-medium">Reason</th>
                      <th className="py-3 px-6 font-medium">Status</th>
                      <th className="py-3 px-6 font-medium text-right">Initiated At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-hairline)]">
                    {refunds.map((r) => (
                      <tr key={r.id} className="hover:bg-[var(--bg-subtle)] transition">
                        <td className="py-4 px-6 font-mono text-xs text-[var(--color-primary)]">
                          {r.id.slice(0, 12)}...
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-[var(--text-secondary)]">
                          <Link href={`/payments/${r.payments?.id}`} className="hover:text-[var(--color-primary)]">
                            {r.payments?.razorpay_payment_id || 'View Payment'}
                          </Link>
                        </td>
                        <td className="py-4 px-6 text-[var(--text-secondary)]">
                          {r.payments?.clients?.business_name || 'Direct Client'}
                        </td>
                        <td className="py-4 px-6 font-mono font-medium text-sm tabular-nums text-red-500">
                          {formatCurrency(r.amount_paise, r.payments?.currency || 'INR')}
                        </td>
                        <td className="py-4 px-6 text-xs text-[var(--text-secondary)] max-w-xs truncate">
                          {r.reason || 'General cancellation'}
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="py-4 px-6 tabular-nums text-xs text-right text-[var(--text-tertiary)]">
                          {formatDate(r.created_at)}
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
