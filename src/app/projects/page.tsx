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
import { Modal } from '@/components/ui/modal';
import {
  FolderGit2,
  Plus,
  Search,
  Building2,
  Activity,
  ArrowRight,
  ShieldCheck,
  Key,
} from 'lucide-react';

interface ProjectItem {
  id: string;
  name: string;
  project_type: string;
  status: string;
  entitlement_status: string;
  total_value_paise: number;
  currency: string;
  created_at: string;
  client_id: string;
  clients?: {
    id: string;
    business_name: string;
  };
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [entitlementFilter, setEntitlementFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    project_type: 'web_app',
    total_value_inr: '',
    description: '',
  });

  const loadData = async () => {
    setLoading(true);
    const supabase = createClient();

    // Fetch projects
    let query = supabase
      .from('projects')
      .select(`
        id,
        name,
        project_type,
        status,
        entitlement_status,
        total_value_paise,
        currency,
        created_at,
        client_id,
        clients (
          id,
          business_name
        )
      `)
      .order('created_at', { ascending: false });

    if (entitlementFilter !== 'all') {
      query = query.eq('entitlement_status', entitlementFilter as any);
    }

    const { data: projs } = await query;
    if (projs) setProjects(projs as any);

    // Fetch clients for dropdown
    const { data: cls } = await supabase
      .from('clients')
      .select('id, business_name')
      .order('business_name');
    if (cls) setClients(cls);

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [entitlementFilter]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    if (!formData.name.trim() || !formData.client_id) {
      setFormError('Project name and client selection are required.');
      setSaving(false);
      return;
    }

    const supabase = createClient();
    const valuePaise = Math.round(parseFloat(formData.total_value_inr || '0') * 100);

    const { error } = await supabase.from('projects').insert([
      {
        name: formData.name.trim(),
        client_id: formData.client_id,
        project_type: formData.project_type,
        total_value_paise: valuePaise >= 0 ? valuePaise : 0,
        currency: 'INR',
        description: formData.description.trim() || null,
        status: 'active',
        entitlement_status: 'active',
      },
    ]);

    if (error) {
      setFormError(error.message);
      setSaving(false);
      return;
    }

    setIsModalOpen(false);
    setFormData({
      name: '',
      client_id: '',
      project_type: 'web_app',
      total_value_inr: '',
      description: '',
    });
    setSaving(false);
    loadData();
  };

  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.clients?.business_name && p.clients.business_name.toLowerCase().includes(q))
    );
  });

  return (
    <AppShell role="admin">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-primary)] bg-[var(--color-primary-subtle)] px-2.5 py-0.5 rounded-full border border-[var(--color-primary-light)]">
                Portfolio Hub
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Projects Management
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Connected web applications, licence boundaries, and remote entitlement control.
            </p>
          </div>

          <Button
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Register Project
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project name, client..."
              className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg pl-10 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-[var(--text-tertiary)] uppercase font-semibold">Entitlement:</span>
            <select
              value={entitlementFilter}
              onChange={(e) => setEntitlementFilter(e.target.value)}
              className="bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3 py-2 text-xs font-medium text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            >
              <option value="all">All States</option>
              <option value="active">Active</option>
              <option value="grace_period">Grace Period</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Projects Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 text-center text-sm text-[var(--text-tertiary)]">
                Loading projects registry...
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <FolderGit2 className="h-10 w-10 text-[var(--text-tertiary)] mx-auto" />
                <p className="text-sm font-medium text-[var(--text-secondary)]">No projects found</p>
                <p className="text-xs text-[var(--text-tertiary)] max-w-sm mx-auto">
                  {searchQuery ? 'Try clearing your search query.' : 'Register your first project to connect SDK telemetry and billing.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border-hairline)] text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                    <tr>
                      <th className="py-3 px-6 font-medium">Project Name</th>
                      <th className="py-3 px-6 font-medium">Client Account</th>
                      <th className="py-3 px-6 font-medium">Type</th>
                      <th className="py-3 px-6 font-medium">Contract Value</th>
                      <th className="py-3 px-6 font-medium">Entitlement Status</th>
                      <th className="py-3 px-6 font-medium">Enrolled Date</th>
                      <th className="py-3 px-6 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-hairline)]">
                    {filteredProjects.map((proj) => (
                      <tr key={proj.id} className="hover:bg-[var(--bg-subtle)] transition">
                        <td className="py-4 px-6 font-medium text-[var(--text-primary)]">
                          <Link
                            href={`/projects/${proj.id}`}
                            className="hover:text-[var(--color-primary)] flex items-center gap-2 group"
                          >
                            <FolderGit2 className="h-4 w-4 text-[var(--color-primary)]" />
                            <span className="font-semibold">{proj.name}</span>
                          </Link>
                        </td>
                        <td className="py-4 px-6 text-[var(--text-secondary)]">
                          {proj.clients?.business_name || 'Internal'}
                        </td>
                        <td className="py-4 px-6 text-xs uppercase tracking-wider text-[var(--text-tertiary)]">
                          {proj.project_type?.replace('_', ' ')}
                        </td>
                        <td className="py-4 px-6 font-mono text-sm tabular-nums text-[var(--text-primary)]">
                          {formatCurrency(proj.total_value_paise || 0, proj.currency)}
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={proj.entitlement_status || 'active'} />
                        </td>
                        <td className="py-4 px-6 tabular-nums text-xs text-[var(--text-tertiary)]">
                          {formatDate(proj.created_at)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center gap-2">
                            <Link href={`/analytics/${proj.id}`}>
                              <Button variant="ghost" size="sm" icon={<Activity className="h-3.5 w-3.5" />}>
                                Telemetry
                              </Button>
                            </Link>
                            <Link href={`/projects/${proj.id}`}>
                              <Button variant="outline" size="sm" icon={<ArrowRight className="h-3.5 w-3.5" />}>
                                Manage
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

        {/* Modal: Register Project */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Register New Client Project"
          description="Create a project entity for SDK integration, licence enforcement, and billing."
        >
          <form onSubmit={handleCreateProject} className="space-y-4">
            {formError && (
              <div className="p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="LostGit Cloud Infrastructure"
                className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Project Type
                </label>
                <select
                  value={formData.project_type}
                  onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                  className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="web_app">Web Application</option>
                  <option value="website">Marketing Website</option>
                  <option value="mobile_app">Mobile Application</option>
                  <option value="software">Desktop Software</option>
                  <option value="maintenance">Maintenance Retainer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Contract Value (INR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.total_value_inr}
                  onChange={(e) => setFormData({ ...formData, total_value_inr: e.target.value })}
                  placeholder="250000"
                  className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Description / Scope (Optional)
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Scope of work, milestone deliverables, technical architecture details..."
                className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-hairline)]">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={saving}>
                Save Project
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
