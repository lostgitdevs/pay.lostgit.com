'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/ui/metric-card';
import { CopyButton } from '@/components/ui/copy-button';
import {
  Building2,
  Receipt,
  FolderGit2,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Zap,
  Key,
  Repeat,
} from 'lucide-react';

export default function ClientPortalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  useEffect(() => {
    async function loadClientData() {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(userProfile);

      if (userProfile?.client_id) {
        const { data: clientData } = await supabase
          .from('clients')
          .select('*')
          .eq('id', userProfile.client_id)
          .single();
        setClient(clientData);

        const { data: clientProjects } = await supabase
          .from('projects')
          .select('*')
          .eq('client_id', userProfile.client_id);
        setProjects(clientProjects || []);

        const { data: clientInvoices } = await supabase
          .from('invoices')
          .select('*')
          .eq('client_id', userProfile.client_id)
          .order('created_at', { ascending: false });
        setInvoices(clientInvoices || []);

        const { data: clientSubs } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('client_id', userProfile.client_id);
        setSubscriptions(clientSubs || []);
      } else {
        // Fallback for demo client
        const { data: anyInvoices } = await supabase.from('invoices').select('*').limit(5);
        setInvoices(anyInvoices || []);
        const { data: anyProjects } = await supabase.from('projects').select('*').limit(3);
        setProjects(anyProjects || []);
      }

      setLoading(false);
    }

    loadClientData();
  }, [router]);

  const totalInvoicedPaise = invoices.reduce((sum, inv) => sum + (inv.total_amount_paise || 0), 0);
  const totalPaidPaise = invoices.reduce((sum, inv) => sum + (inv.amount_paid_paise || 0), 0);
  const balanceDuePaise = Math.max(0, totalInvoicedPaise - totalPaidPaise);

  return (
    <AppShell role="client">
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-primary)] bg-[var(--color-primary-subtle)] px-2.5 py-0.5 rounded-full border border-[var(--color-primary-light)]">
                Client Command Portal
              </span>
              <span className="text-xs text-emerald-500 flex items-center gap-1 font-medium">
                <ShieldCheck className="h-3.5 w-3.5" /> Account in Good Standing
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              {client?.business_name || profile?.full_name || 'Your Client Portal'}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Real-time overview of your milestone invoices, settled receipts, and application licence keys.
            </p>
          </div>
        </div>

        {/* Client KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Billed"
            value={formatCurrency(totalInvoicedPaise)}
            change="All contracted phases"
            changeType="neutral"
            icon={<Receipt className="h-5 w-5" />}
            isLoading={loading}
          />
          <MetricCard
            title="Total Paid"
            value={formatCurrency(totalPaidPaise)}
            change="Confirmed settlements"
            changeType="positive"
            icon={<CreditCard className="h-5 w-5" />}
            isLoading={loading}
          />
          <MetricCard
            title="Balance Due"
            value={formatCurrency(balanceDuePaise)}
            change={balanceDuePaise > 0 ? 'Pending payment' : 'Zero balance'}
            changeType={balanceDuePaise > 0 ? 'warning' : 'positive'}
            icon={<Clock className="h-5 w-5" />}
            isLoading={loading}
          />
          <MetricCard
            title="Connected Projects"
            value={projects.length.toString()}
            subvalue="Active runtime instances"
            icon={<FolderGit2 className="h-5 w-5" />}
            isLoading={loading}
          />
        </div>

        {/* Invoices Ledger Card */}
        <Card>
          <CardHeader
            title="Invoices & Milestone Billing"
            description="Itemized invoices with instant UPI & Card checkout portals"
          />
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 text-center text-sm text-[var(--text-tertiary)]">
                Loading your invoices...
              </div>
            ) : invoices.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Receipt className="h-10 w-10 text-[var(--text-tertiary)] mx-auto" />
                <p className="text-sm font-medium text-[var(--text-secondary)]">No invoices issued yet</p>
                <p className="text-xs text-[var(--text-tertiary)] max-w-sm mx-auto">
                  When a milestone invoice is issued by LostGit Solutions, it will appear here with a secure payment link.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--bg-subtle)] border-y border-[var(--border-hairline)] text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                    <tr>
                      <th className="py-3 px-6 font-medium">Invoice Number</th>
                      <th className="py-3 px-6 font-medium">Total Amount</th>
                      <th className="py-3 px-6 font-medium">Amount Paid</th>
                      <th className="py-3 px-6 font-medium">Status</th>
                      <th className="py-3 px-6 font-medium">Due Date</th>
                      <th className="py-3 px-6 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-hairline)]">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-[var(--bg-subtle)] transition">
                        <td className="py-4 px-6 font-mono text-xs font-semibold text-[var(--text-primary)]">
                          {inv.invoice_number}
                        </td>
                        <td className="py-4 px-6 font-mono font-medium text-sm tabular-nums text-[var(--text-primary)]">
                          {formatCurrency(inv.total_amount_paise, inv.currency)}
                        </td>
                        <td className="py-4 px-6 font-mono text-sm tabular-nums text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(inv.amount_paid_paise || 0, inv.currency)}
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={inv.status} />
                        </td>
                        <td className="py-4 px-6 tabular-nums text-xs text-[var(--text-tertiary)]">
                          {inv.due_date ? formatDate(inv.due_date) : 'On Receipt'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center gap-2">
                            {inv.status !== 'paid' && inv.payment_link_token && (
                              <Link href={`/pay/${inv.payment_link_token}`} target="_blank">
                                <Button variant="primary" size="sm" icon={<ExternalLink className="h-3.5 w-3.5" />}>
                                  Pay Now
                                </Button>
                              </Link>
                            )}
                            <Link href={`/invoices/${inv.id}`}>
                              <Button variant="outline" size="sm">
                                View Receipt
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Projects & Licence Keys */}
        <Card>
          <CardHeader
            title="Application Licences & Entitlements"
            description="Active software instances and verified domain origins"
          />
          <CardContent className="p-0">
            {projects.length === 0 ? (
              <div className="py-12 text-center text-sm text-[var(--text-tertiary)]">
                No active projects registered to your account.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--bg-subtle)] border-y border-[var(--border-hairline)] text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                    <tr>
                      <th className="py-3 px-6 font-medium">Application Name</th>
                      <th className="py-3 px-6 font-medium">Type</th>
                      <th className="py-3 px-6 font-medium">Runtime Status</th>
                      <th className="py-3 px-6 font-medium">Licence Key</th>
                      <th className="py-3 px-6 font-medium text-right">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-hairline)]">
                    {projects.map((proj) => (
                      <tr key={proj.id} className="hover:bg-[var(--bg-subtle)] transition">
                        <td className="py-4 px-6 font-medium text-[var(--text-primary)]">
                          {proj.name}
                        </td>
                        <td className="py-4 px-6 text-xs uppercase tracking-wider text-[var(--text-tertiary)]">
                          {proj.project_type?.replace('_', ' ')}
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={proj.entitlement_status || 'active'} />
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-[var(--text-secondary)]">
                          {proj.licence_key ? (
                            <div className="flex items-center gap-2">
                              <span>{proj.licence_key.slice(0, 12)}...</span>
                              <CopyButton text={proj.licence_key} label="Copy" copiedLabel="Copied!" />
                            </div>
                          ) : (
                            <span className="text-[var(--text-tertiary)] italic">Provisioning</span>
                          )}
                        </td>
                        <td className="py-4 px-6 tabular-nums text-xs text-right text-[var(--text-tertiary)]">
                          {formatDate(proj.created_at)}
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
