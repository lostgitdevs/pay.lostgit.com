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
import { Modal } from '@/components/ui/modal';
import {
  FolderGit2,
  Building2,
  Activity,
  Key,
  Receipt,
  Code2,
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Play,
  Pause,
  Plus,
} from 'lucide-react';

export default function ProjectHubPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [licences, setLicences] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'integration' | 'invoices' | 'licences'>('overview');

  // Entitlement Modal State
  const [entitlementModalOpen, setEntitlementModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<string>('active');
  const [statusReason, setStatusReason] = useState<string>('');
  const [updatingEntitlement, setUpdatingEntitlement] = useState(false);

  const loadProjectData = async () => {
    if (!projectId) return;
    const supabase = createClient();

    // Fetch project
    const { data: projData, error: projErr } = await supabase
      .from('projects')
      .select(`
        *,
        clients (
          id,
          business_name,
          email
        )
      `)
      .eq('id', projectId)
      .single();

    if (projErr || !projData) {
      setLoading(false);
      return;
    }

    setProject(projData);

    // Fetch invoices for project
    const { data: invData } = await supabase
      .from('invoices')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    setInvoices(invData || []);

    // Fetch licence keys for project
    const { data: licData } = await supabase
      .from('licences')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    setLicences(licData || []);

    setLoading(false);
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const handleUpdateEntitlement = async () => {
    setUpdatingEntitlement(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('projects')
      .update({ entitlement_status: targetStatus as any })
      .eq('id', projectId);

    if (!error) {
      // Record audit log
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('audit_logs').insert([
        {
          user_id: user?.id || null,
          action: `entitlement_change:${targetStatus}`,
          entity_type: 'projects',
          entity_id: projectId,
          details: {
            old_status: project.entitlement_status,
            new_status: targetStatus,
            reason: statusReason,
          },
        },
      ]);


      setProject({ ...project, entitlement_status: targetStatus });
      setEntitlementModalOpen(false);
      setStatusReason('');
    }

    setUpdatingEntitlement(false);
  };

  const openEntitlementConfirmation = (status: string) => {
    setTargetStatus(status);
    setEntitlementModalOpen(true);
  };

  if (loading) {
    return (
      <AppShell role="admin">
        <div className="py-24 text-center text-sm text-[var(--text-tertiary)] animate-pulse">
          Loading project management hub...
        </div>
      </AppShell>
    );
  }

  if (!project) {
    return (
      <AppShell role="admin">
        <div className="py-24 text-center space-y-4">
          <p className="text-lg font-semibold text-[var(--text-primary)]">Project not found</p>
          <Link href="/projects">
            <Button variant="outline" icon={<ArrowLeft className="h-4 w-4" />}>
              Back to Projects
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const snippetCode = `<!-- LostGit Pay Telemetry & Entitlement SDK -->
<script 
  src="https://pay.lostgit.com/lostgit-pay-sdk.js" 
  data-site-id="${project.id}" 
  defer>
</script>`;

  return (
    <AppShell role="admin">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Navigation & Header */}
        <div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] mb-3 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Projects Directory
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-[var(--color-primary-subtle)] border border-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)]">
                <FolderGit2 className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                    {project.name}
                  </h1>
                  <StatusBadge status={project.entitlement_status || 'active'} />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)] mt-1.5">
                  <Link
                    href={`/clients/${project.client_id}`}
                    className="flex items-center gap-1 hover:text-[var(--color-primary)] font-medium"
                  >
                    <Building2 className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                    {project.clients?.business_name || 'LostGit Enterprise'}
                  </Link>
                  <span className="text-[var(--text-tertiary)]">•</span>
                  <span className="uppercase tracking-wider font-mono">
                    {project.project_type?.replace('_', ' ')}
                  </span>
                  <span className="text-[var(--text-tertiary)]">•</span>
                  <span className="tabular-nums font-mono text-[var(--text-primary)] font-semibold">
                    {formatCurrency(project.total_value_paise || 0, project.currency)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/analytics/${project.id}`}>
                <Button variant="outline" size="sm" icon={<Activity className="h-4 w-4" />}>
                  Live Telemetry
                </Button>
              </Link>
              <Link href="/invoices">
                <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />}>
                  Issue Invoice
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-[var(--border-hairline)]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3 text-sm font-medium border-b-2 transition cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)] font-semibold'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Overview & Entitlement
          </button>
          <button
            onClick={() => setActiveTab('integration')}
            className={`pb-3 px-3 text-sm font-medium border-b-2 transition cursor-pointer ${
              activeTab === 'integration'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)] font-semibold'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            SDK Integration
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`pb-3 px-3 text-sm font-medium border-b-2 transition cursor-pointer ${
              activeTab === 'invoices'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)] font-semibold'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('licences')}
            className={`pb-3 px-3 text-sm font-medium border-b-2 transition cursor-pointer ${
              activeTab === 'licences'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)] font-semibold'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Licences ({licences.length})
          </button>
        </div>

        {/* Tab 1: Overview & Entitlement Control */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Remote Entitlement Kill-Switch Box */}
            <div className="border border-[var(--border-hairline)] bg-[var(--surface-1)] rounded-xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="h-5 w-5 text-[var(--color-primary)]" />
                    <h2 className="text-base font-semibold text-[var(--text-primary)]">
                      Remote Entitlement Control Switch
                    </h2>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] max-w-xl">
                    Allows operators to remotely grant, warn, or suspend the runtime execution of client-hosted apps in case of overdue milestone payments or breach of licensing terms.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {project.entitlement_status !== 'active' && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Play className="h-4 w-4" />}
                      onClick={() => openEntitlementConfirmation('active')}
                    >
                      Restore Active
                    </Button>
                  )}
                  {project.entitlement_status !== 'grace_period' && (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
                      onClick={() => openEntitlementConfirmation('grace_period')}
                    >
                      Set Grace Period
                    </Button>
                  )}
                  {project.entitlement_status !== 'suspended' && (
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<Pause className="h-4 w-4" />}
                      onClick={() => openEntitlementConfirmation('suspended')}
                    >
                      Suspend Access
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--border-hairline)] flex items-center justify-between text-xs">
                <span className="text-[var(--text-tertiary)]">
                  Current state:{' '}
                  <span className="font-semibold text-[var(--text-primary)] uppercase">
                    {project.entitlement_status}
                  </span>
                </span>
                <span className="text-[var(--text-tertiary)] font-mono">
                  Site ID: {project.id}
                </span>
              </div>
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader title="Project Information" />
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between py-1 border-b border-[var(--border-hairline)]">
                    <span className="text-[var(--text-secondary)]">Description</span>
                    <span className="text-[var(--text-primary)] font-medium text-right max-w-xs">
                      {project.description || 'No description provided.'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--border-hairline)]">
                    <span className="text-[var(--text-secondary)]">Total Value</span>
                    <span className="font-mono tabular-nums text-[var(--text-primary)] font-semibold">
                      {formatCurrency(project.total_value_paise || 0, project.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--border-hairline)]">
                    <span className="text-[var(--text-secondary)]">Project Status</span>
                    <StatusBadge status={project.status || 'active'} />
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[var(--text-secondary)]">Created At</span>
                    <span className="tabular-nums text-xs text-[var(--text-tertiary)]">
                      {formatDate(project.created_at)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Security & Verification" />
                <CardContent className="space-y-4 text-xs text-[var(--text-secondary)] leading-relaxed">
                  <p>
                    LostGit Pay SDK uses cryptographic signature verification and hourly entitlement heartbeat pinging. If suspended, the client application displays a customized payment settlement prompt.
                  </p>
                  <div className="p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-hairline)] space-y-1 font-mono">
                    <div className="text-[var(--text-primary)] font-semibold">Entitlement Endpoints:</div>
                    <div className="text-[var(--text-tertiary)]">GET /api/v1/licence/verify</div>
                    <div className="text-[var(--text-tertiary)]">POST /api/v1/analytics/events</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: Integration Snippet */}
        {activeTab === 'integration' && (
          <Card>
            <CardHeader
              title="SDK Client Integration"
              description="Copy and paste this snippet into the client's <head> or before </body> tag."
              action={
                <CopyButton text={snippetCode} label="Copy Snippet" copiedLabel="Copied Code!" />
              }
            />
            <CardContent className="space-y-4">
              <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
                <code>{snippetCode}</code>
              </pre>

              <div className="text-xs text-[var(--text-secondary)] space-y-2">
                <p className="font-semibold text-[var(--text-primary)]">SDK Attributes:</p>
                <ul className="list-disc pl-5 space-y-1 text-[var(--text-tertiary)]">
                  <li><strong className="text-[var(--text-secondary)]">data-site-id</strong>: Uniquely identifies this project for DPDP-compliant telemetry and remote entitlement status.</li>
                  <li><strong className="text-[var(--text-secondary)]">defer</strong>: Ensures zero impact on client first contentful paint (FCP) and Core Web Vitals.</li>
                  <li>No cookies or persistent PII are ever collected.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab 3: Invoices */}
        {activeTab === 'invoices' && (
          <Card>
            <CardHeader title="Project Invoices" />
            <CardContent className="p-0">
              {invoices.length === 0 ? (
                <div className="py-12 text-center text-sm text-[var(--text-tertiary)]">
                  No invoices issued for this project yet.
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
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-[var(--bg-subtle)] transition">
                          <td className="py-3.5 px-6 font-mono text-xs font-semibold">{inv.invoice_number}</td>
                          <td className="py-3.5 px-6 font-mono text-sm tabular-nums">
                            {formatCurrency(inv.total_amount_paise, inv.currency)}
                          </td>
                          <td className="py-3.5 px-6 font-mono text-sm tabular-nums text-emerald-500">
                            {formatCurrency(inv.amount_paid_paise || 0, inv.currency)}
                          </td>
                          <td className="py-3.5 px-6">
                            <StatusBadge status={inv.status} />
                          </td>
                          <td className="py-3.5 px-6 tabular-nums text-xs text-[var(--text-tertiary)]">
                            {inv.due_date ? formatDate(inv.due_date) : 'On Receipt'}
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            <Link href={`/invoices/${inv.id}`}>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 4: Licences */}
        {activeTab === 'licences' && (
          <Card>
            <CardHeader
              title="Issued Licence Keys"
              action={
                <Link href="/licences">
                  <Button variant="outline" size="sm" icon={<Plus className="h-4 w-4" />}>
                    Issue Licence Key
                  </Button>
                </Link>
              }
            />
            <CardContent className="p-0">
              {licences.length === 0 ? (
                <div className="py-12 text-center text-sm text-[var(--text-tertiary)]">
                  No licence keys generated for this project yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[var(--bg-subtle)] border-y border-[var(--border-hairline)] text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                      <tr>
                        <th className="py-3 px-6 font-medium">Licence Key</th>
                        <th className="py-3 px-6 font-medium">Status</th>
                        <th className="py-3 px-6 font-medium">Created Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-hairline)]">
                      {licences.map((lic) => (
                        <tr key={lic.id} className="hover:bg-[var(--bg-subtle)] transition">
                          <td className="py-3.5 px-6 font-mono text-xs text-[var(--color-primary)]">
                            {lic.key_hash ? `lgp_${lic.key_hash.slice(0, 16)}...` : 'lgp_live_key'}
                          </td>
                          <td className="py-3.5 px-6">
                            <StatusBadge status={lic.status || 'active'} />
                          </td>
                          <td className="py-3.5 px-6 tabular-nums text-xs text-[var(--text-tertiary)]">
                            {formatDate(lic.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Modal: Confirm Entitlement Status Change */}
        <Modal
          isOpen={entitlementModalOpen}
          onClose={() => setEntitlementModalOpen(false)}
          title={`Confirm Entitlement Update: ${targetStatus.toUpperCase()}`}
          description={`You are about to change the remote entitlement status to '${targetStatus}'. This affects live verification requests from client applications.`}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Reason / Audit Note *
              </label>
              <textarea
                rows={3}
                required
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Overdue milestone invoice #INV-002, or client contract completed..."
                className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-hairline)]">
              <Button type="button" variant="outline" onClick={() => setEntitlementModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant={targetStatus === 'suspended' ? 'danger' : 'primary'}
                isLoading={updatingEntitlement}
                onClick={handleUpdateEntitlement}
              >
                Apply Entitlement Change
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}
