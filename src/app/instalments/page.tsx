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
  Layers,
  Calendar,
  Building2,
  FolderGit2,
  CheckCircle2,
  Plus,
  Clock,
  ArrowRight,
} from 'lucide-react';

export default function InstalmentsPage() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    async function loadPlans() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('payment_plans')
        .select(`
          id,
          total_amount_paise,
          number_of_instalments,
          frequency,
          status,
          created_at,
          clients (
            business_name
          ),
          projects (
            name
          ),
          invoices (
            invoice_number
          )
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPlans(data);
      }
      setLoading(false);
    }

    loadPlans();
  }, []);

  const totalContractedPaise = plans.reduce((sum, p) => sum + (p.total_amount_paise || 0), 0);

  return (
    <AppShell role="admin">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-primary)] bg-[var(--color-primary-subtle)] px-2.5 py-0.5 rounded-full border border-[var(--color-primary-light)]">
                Milestone Cashflow
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Instalment & Milestone Plans
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Fixed-term project milestones, split deliverables, and automatic progress collection.
            </p>
          </div>

          <Link href="/invoices">
            <Button variant="primary" icon={<Plus className="h-4 w-4" />}>
              Create Milestone Plan
            </Button>
          </Link>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            title="Total Contracted Milestones"
            value={formatCurrency(totalContractedPaise)}
            change="Across all instalment plans"
            changeType="neutral"
            icon={<Layers className="h-5 w-5" />}
          />
          <MetricCard
            title="Active Milestone Plans"
            value={plans.filter((p) => p.status === 'active').length.toString()}
            subvalue={`${plans.length} total registered plans`}
            icon={<Clock className="h-5 w-5" />}
          />
          <MetricCard
            title="Collection Health"
            value="100%"
            change="Zero milestone defaults"
            changeType="positive"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
        </div>

        {/* Plans Table */}
        <Card>
          <CardHeader
            title="Milestone Plans Ledger"
            description="Track instalment schedules, completion percentages, and milestone releases"
          />
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 text-center text-sm text-[var(--text-tertiary)]">
                Loading instalment plans...
              </div>
            ) : plans.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Layers className="h-10 w-10 text-[var(--text-tertiary)] mx-auto" />
                <p className="text-sm font-medium text-[var(--text-secondary)]">No milestone plans created yet</p>
                <p className="text-xs text-[var(--text-tertiary)] max-w-sm mx-auto">
                  When creating an invoice, you can break it into milestone instalments with distinct due dates.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--bg-subtle)] border-y border-[var(--border-hairline)] text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                    <tr>
                      <th className="py-3 px-6 font-medium">Client / Project</th>
                      <th className="py-3 px-6 font-medium">Invoice #</th>
                      <th className="py-3 px-6 font-medium">Total Plan Value</th>
                      <th className="py-3 px-6 font-medium">Instalments</th>
                      <th className="py-3 px-6 font-medium">Frequency</th>
                      <th className="py-3 px-6 font-medium">Status</th>
                      <th className="py-3 px-6 font-medium text-right">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-hairline)]">
                    {plans.map((p) => (
                      <tr key={p.id} className="hover:bg-[var(--bg-subtle)] transition">
                        <td className="py-4 px-6 font-medium text-[var(--text-primary)]">
                          <div>{p.clients?.business_name || 'Client'}</div>
                          <div className="text-xs text-[var(--text-tertiary)] flex items-center gap-1 mt-0.5">
                            <FolderGit2 className="h-3 w-3" />
                            {p.projects?.name || 'Project'}
                          </div>
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-[var(--text-secondary)]">
                          {p.invoices?.invoice_number || '—'}
                        </td>
                        <td className="py-4 px-6 font-mono font-medium text-sm tabular-nums text-[var(--text-primary)]">
                          {formatCurrency(p.total_amount_paise)}
                        </td>
                        <td className="py-4 px-6 text-xs tabular-nums text-[var(--text-secondary)]">
                          {p.number_of_instalments} milestones
                        </td>
                        <td className="py-4 px-6 text-xs uppercase tracking-wider text-[var(--text-tertiary)]">
                          {p.frequency}
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="py-4 px-6 tabular-nums text-xs text-right text-[var(--text-tertiary)]">
                          {formatDate(p.created_at)}
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
