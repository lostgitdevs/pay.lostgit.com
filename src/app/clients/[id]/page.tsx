'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
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
  Mail,
  Phone,
  FileSpreadsheet,
  FolderGit2,
  Receipt,
  Plus,
  ArrowLeft,
  Calendar,
  ExternalLink,
} from 'lucide-react';

export default function ClientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    async function loadClientData() {
      if (!clientId) return;
      const supabase = createClient();

      // Fetch client
      const { data: clientData, error: clientErr } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (clientErr || !clientData) {
        setLoading(false);
        return;
      }

      setClient(clientData);

      // Fetch projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      setProjects(projectsData || []);

      // Fetch invoices
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      setInvoices(invoicesData || []);
      setLoading(false);
    }

    loadClientData();
  }, [clientId]);

  if (loading) {
    return (
      <AppShell role="admin">
        <div className="py-24 text-center text-sm text-[var(--text-tertiary)] animate-pulse">
          Loading client profile...
        </div>
      </AppShell>
    );
  }

  if (!client) {
    return (
      <AppShell role="admin">
        <div className="py-24 text-center space-y-4">
          <p className="text-lg font-semibold text-[var(--text-primary)]">Client not found</p>
          <Link href="/clients">
            <Button variant="outline" icon={<ArrowLeft className="h-4 w-4" />}>
              Back to Clients Directory
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.total_amount_paise || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.amount_paid_paise || 0), 0);
  const outstanding = Math.max(0, totalInvoiced - totalPaid);

  return (
    <AppShell role="admin">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Navigation & Header */}
        <div>
          <Link
            href="/clients"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] mb-3 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Clients Directory
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-[var(--color-primary-subtle)] border border-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)]">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                    {client.business_name}
                  </h1>
                  <StatusBadge status={client.status} />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)] mt-1.5">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-[var(--text-tertiary)]" /> {client.email}
                  </span>
                  {client.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-[var(--text-tertiary)]" /> {client.phone}
                    </span>
                  )}
                  {client.tax_id && (
                    <span className="font-mono bg-[var(--bg-subtle)] px-2 py-0.5 rounded border border-[var(--border-hairline)]">
                      GSTIN: {client.tax_id}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[var(--text-tertiary)]">
                    <Calendar className="h-3.5 w-3.5" /> Enrolled {formatDate(client.created_at)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/invoices">
                <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />}>
                  Issue Invoice
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Client KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Invoiced"
            value={formatCurrency(totalInvoiced)}
            change="All contracts"
            changeType="neutral"
            icon={<Receipt className="h-5 w-5" />}
          />
          <MetricCard
            title="Total Paid"
            value={formatCurrency(totalPaid)}
            change="Realized receipts"
            changeType="positive"
            icon={<Receipt className="h-5 w-5" />}
          />
          <MetricCard
            title="Current Balance"
            value={formatCurrency(outstanding)}
            change={outstanding > 0 ? 'Pending collection' : 'Fully settled'}
            changeType={outstanding > 0 ? 'warning' : 'positive'}
            icon={<Receipt className="h-5 w-5" />}
          />
          <MetricCard
            title="Active Projects"
            value={projects.length.toString()}
            subvalue="Connected apps"
            icon={<FolderGit2 className="h-5 w-5" />}
          />
        </div>

        {/* Projects Table */}
        <Card>
          <CardHeader
            title="Client Projects"
            description="Software, web applications, and ongoing maintenance retainers"
          />
          <CardContent className="p-0">
            {projects.length === 0 ? (
              <div className="py-12 text-center text-sm text-[var(--text-tertiary)]">
                No projects registered for this client yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--bg-subtle)] border-y border-[var(--border-hairline)] text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                    <tr>
                      <th className="py-3 px-6 font-medium">Project Name</th>
                      <th className="py-3 px-6 font-medium">Type</th>
                      <th className="py-3 px-6 font-medium">Entitlement Status</th>
                      <th className="py-3 px-6 font-medium">Value</th>
                      <th className="py-3 px-6 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-hairline)]">
                    {projects.map((proj) => (
                      <tr key={proj.id} className="hover:bg-[var(--bg-subtle)] transition">
                        <td className="py-3.5 px-6 font-medium text-[var(--text-primary)]">
                          {proj.name}
                        </td>
                        <td className="py-3.5 px-6 text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                          {proj.project_type?.replace('_', ' ')}
                        </td>
                        <td className="py-3.5 px-6">
                          <StatusBadge status={proj.entitlement_status || 'active'} />
                        </td>
                        <td className="py-3.5 px-6 font-mono text-sm tabular-nums">
                          {formatCurrency(proj.total_value_paise || 0, proj.currency)}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <div className="inline-flex items-center gap-2">
                            <Link href={`/analytics/${proj.id}`}>
                              <Button variant="ghost" size="sm">
                                Telemetry
                              </Button>
                            </Link>
                            <Link href={`/projects/${proj.id}`}>
                              <Button variant="outline" size="sm">
                                View Hub
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

        {/* Invoices Table */}
        <Card>
          <CardHeader
            title="Invoices & Milestone Billing"
            description="Itemized invoices and checkout tokens for this client"
          />
          <CardContent className="p-0">
            {invoices.length === 0 ? (
              <div className="py-12 text-center text-sm text-[var(--text-tertiary)]">
                No invoices issued for this client yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--bg-subtle)] border-y border-[var(--border-hairline)] text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                    <tr>
                      <th className="py-3 px-6 font-medium">Invoice Number</th>
                      <th className="py-3 px-6 font-medium">Total</th>
                      <th className="py-3 px-6 font-medium">Paid</th>
                      <th className="py-3 px-6 font-medium">Status</th>
                      <th className="py-3 px-6 font-medium">Due Date</th>
                      <th className="py-3 px-6 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-hairline)]">
                    {invoices.map((inv) => {
                      const payLink = typeof window !== 'undefined'
                        ? `${window.location.origin}/pay/${inv.payment_link_token}`
                        : `/pay/${inv.payment_link_token}`;

                      return (
                        <tr key={inv.id} className="hover:bg-[var(--bg-subtle)] transition">
                          <td className="py-3.5 px-6 font-mono text-xs font-semibold text-[var(--text-primary)]">
                            {inv.invoice_number}
                          </td>
                          <td className="py-3.5 px-6 font-mono font-medium text-sm tabular-nums text-[var(--text-primary)]">
                            {formatCurrency(inv.total_amount_paise, inv.currency)}
                          </td>
                          <td className="py-3.5 px-6 font-mono text-sm tabular-nums text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(inv.amount_paid_paise || 0, inv.currency)}
                          </td>
                          <td className="py-3.5 px-6">
                            <StatusBadge status={inv.status} />
                          </td>
                          <td className="py-3.5 px-6 tabular-nums text-xs text-[var(--text-tertiary)]">
                            {inv.due_date ? formatDate(inv.due_date) : 'On Receipt'}
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            <div className="inline-flex items-center gap-2">
                              {inv.payment_link_token && (
                                <CopyButton
                                  text={payLink}
                                  label="Copy Link"
                                  copiedLabel="Copied!"
                                />
                              )}
                              <Link href={`/invoices/${inv.id}`}>
                                <Button variant="outline" size="sm">
                                  Details
                                </Button>
                              </Link>
                              {inv.payment_link_token && (
                                <Link href={`/pay/${inv.payment_link_token}`} target="_blank">
                                  <Button variant="ghost" size="sm" icon={<ExternalLink className="h-3.5 w-3.5" />} />
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
