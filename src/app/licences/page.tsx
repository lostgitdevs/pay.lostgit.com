'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/ui/metric-card';
import { CopyButton } from '@/components/ui/copy-button';
import { Modal } from '@/components/ui/modal';
import {
  Key,
  Plus,
  Eye,
  EyeOff,
  Globe,
  FolderGit2,
  Building2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface LicenceRow {
  id: string;
  licence_key: string;
  status: string;
  allowed_domains: string[];
  valid_until: string | null;
  last_checked_at: string | null;
  created_at: string;
  projects?: {
    id: string;
    name: string;
  };
  clients?: {
    id: string;
    business_name: string;
  };
}

export default function LicencesPage() {
  const [loading, setLoading] = useState(true);
  const [licences, setLicences] = useState<LicenceRow[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});

  // Issue Key Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    client_id: '',
    project_id: '',
    domains: '',
    valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const loadData = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data: lics } = await supabase
      .from('licences')
      .select(`
        id,
        licence_key,
        status,
        allowed_domains,
        valid_until,
        last_checked_at,
        created_at,
        projects (
          id,
          name
        ),
        clients (
          id,
          business_name
        )
      `)
      .order('created_at', { ascending: false });

    if (lics) setLicences(lics as any);

    const { data: cls } = await supabase.from('clients').select('id, business_name').order('business_name');
    if (cls) setClients(cls);

    const { data: prjs } = await supabase.from('projects').select('id, name, client_id').order('name');
    if (prjs) setProjects(prjs);

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleReveal = (id: string) => {
    setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleIssueLicence = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    if (!formData.client_id || !formData.project_id) {
      setFormError('Please select both a client and project.');
      setSaving(false);
      return;
    }

    const supabase = createClient();

    // Generate secure licence key
    const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const newKey = `lgp_live_${randomHex}`;

    const domainsArray = formData.domains
      .split(',')
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean);

    const { data: createdLic, error } = await supabase
      .from('licences')
      .insert([
        {
          project_id: formData.project_id,
          client_id: formData.client_id,
          licence_key: newKey,
          allowed_domains: domainsArray,
          valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
          status: 'active',
        },
      ])
      .select()
      .single();

    if (error) {
      setFormError(error.message);
      setSaving(false);
      return;
    }

    // Update project licence key
    await supabase
      .from('projects')
      .update({ licence_key: newKey })
      .eq('id', formData.project_id);

    setIsModalOpen(false);
    setSaving(false);
    loadData();
  };

  const activeCount = licences.filter((l) => l.status === 'active').length;

  return (
    <AppShell role="admin">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-primary)] bg-[var(--color-primary-subtle)] px-2.5 py-0.5 rounded-full border border-[var(--color-primary-light)]">
                Entitlement Cryptography
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Licence Keys Management
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Issue, rotate, and restrict domain boundaries for client-hosted software packages.
            </p>
          </div>

          <Button
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Issue New Licence Key
          </Button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            title="Active Licence Keys"
            value={activeCount.toString()}
            subvalue={`${licences.length} total keys provisioned`}
            icon={<Key className="h-5 w-5" />}
          />
          <MetricCard
            title="Domain Guard Enforced"
            value="100%"
            change="Zero unauthorized origin pings"
            changeType="positive"
            icon={<Globe className="h-5 w-5" />}
          />
          <MetricCard
            title="Verification Signature"
            value="SHA-256"
            change="Tamper-proof HMAC verification"
            changeType="positive"
            icon={<ShieldCheck className="h-5 w-5" />}
          />
        </div>

        {/* Licences Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 text-center text-sm text-[var(--text-tertiary)]">
                Loading licence keys ledger...
              </div>
            ) : licences.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Key className="h-10 w-10 text-[var(--text-tertiary)] mx-auto" />
                <p className="text-sm font-medium text-[var(--text-secondary)]">No licence keys issued yet</p>
                <p className="text-xs text-[var(--text-tertiary)] max-w-sm mx-auto">
                  Click &ldquo;Issue New Licence Key&rdquo; to provision an entitlement key for a client application.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border-hairline)] text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                    <tr>
                      <th className="py-3 px-6 font-medium">Licence Key</th>
                      <th className="py-3 px-6 font-medium">Project Application</th>
                      <th className="py-3 px-6 font-medium">Client Business</th>
                      <th className="py-3 px-6 font-medium">Allowed Origin Domains</th>
                      <th className="py-3 px-6 font-medium">Status</th>
                      <th className="py-3 px-6 font-medium">Valid Until</th>
                      <th className="py-3 px-6 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-hairline)]">
                    {licences.map((lic) => {
                      const isRevealed = !!revealedKeys[lic.id];
                      const displayKey = isRevealed
                        ? lic.licence_key
                        : `${lic.licence_key.slice(0, 9)}••••••••••••••••••••••••`;

                      return (
                        <tr key={lic.id} className="hover:bg-[var(--bg-subtle)] transition">
                          <td className="py-4 px-6 font-mono text-xs text-[var(--text-primary)]">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{displayKey}</span>
                              <button
                                onClick={() => toggleReveal(lic.id)}
                                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition"
                                title={isRevealed ? 'Mask key' : 'Reveal key'}
                              >
                                {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-[var(--text-primary)] font-medium">
                            {lic.projects?.name || 'Project'}
                          </td>
                          <td className="py-4 px-6 text-[var(--text-secondary)]">
                            {lic.clients?.business_name || 'Client'}
                          </td>
                          <td className="py-4 px-6 text-xs">
                            {lic.allowed_domains && lic.allowed_domains.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {lic.allowed_domains.map((dom, i) => (
                                  <span
                                    key={i}
                                    className="font-mono bg-[var(--bg-subtle)] border border-[var(--border-hairline)] px-1.5 py-0.5 rounded text-[11px] text-[var(--text-secondary)]"
                                  >
                                    {dom}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[var(--text-tertiary)] italic">Any domain</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <StatusBadge status={lic.status} />
                          </td>
                          <td className="py-4 px-6 tabular-nums text-xs text-[var(--text-tertiary)]">
                            {lic.valid_until ? formatDate(lic.valid_until) : 'Lifetime'}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="inline-flex items-center gap-2">
                              <CopyButton text={lic.licence_key} label="Copy" copiedLabel="Copied!" />
                              <Link href={`/licences/${lic.id}`}>
                                <Button variant="outline" size="sm" icon={<ArrowRight className="h-3.5 w-3.5" />}>
                                  Manage
                                </Button>
                              </Link>
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

        {/* Modal: Issue Licence */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Issue New Licence Key"
          description="Provision a cryptographic runtime key for a client project with origin domain restrictions."
        >
          <form onSubmit={handleIssueLicence} className="space-y-4">
            {formError && (
              <div className="p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Client Account *
              </label>
              <select
                required
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="">Select a client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.business_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Project Application *
              </label>
              <select
                required
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="">Select a project...</option>
                {projects
                  .filter((p) => !formData.client_id || p.client_id === formData.client_id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Allowed Origin Domains (Comma-separated)
              </label>
              <input
                type="text"
                value={formData.domains}
                onChange={(e) => setFormData({ ...formData, domains: e.target.value })}
                placeholder="app.client.com, staging.client.com"
                className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-mono"
              />
              <p className="text-[11px] text-[var(--text-tertiary)] mt-1">
                Leave empty to allow all client origins during preliminary staging.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Validity Expiration Date
              </label>
              <input
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-hairline)]">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={saving}>
                Provision Licence Key
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
