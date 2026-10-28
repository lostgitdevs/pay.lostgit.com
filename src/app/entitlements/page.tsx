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
import { Modal } from '@/components/ui/modal';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Play,
  Pause,
  FolderGit2,
  Building2,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface ProjectEntitlement {
  id: string;
  name: string;
  entitlement_status: string;
  created_at: string;
  clients?: {
    business_name: string;
  };
}

export default function EntitlementsCenterPage() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectEntitlement[]>([]);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectEntitlement | null>(null);
  const [targetStatus, setTargetStatus] = useState<string>('active');
  const [reason, setReason] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const loadProjects = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        entitlement_status,
        created_at,
        clients (
          business_name
        )
      `)
      .order('name');

    if (!error && data) {
      setProjects(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const openStatusChangeModal = (project: ProjectEntitlement, status: string) => {
    setSelectedProject(project);
    setTargetStatus(status);
    setReason('');
    setModalOpen(true);
  };

  const handleApplyStatus = async () => {
    if (!selectedProject) return;
    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('projects')
      .update({ entitlement_status: targetStatus as any })
      .eq('id', selectedProject.id);


    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('audit_logs').insert([
        {
          user_id: user?.id || null,
          action: `remote_entitlement_set_${targetStatus}`,
          entity_type: 'projects',
          entity_id: selectedProject.id,
          details: {
            old_status: selectedProject.entitlement_status,
            new_status: targetStatus,
            reason: reason || 'Operator remote control change',
          },
        },
      ]);

      setModalOpen(false);
      loadProjects();
    }
    setSaving(false);
  };

  const activeCount = projects.filter((p) => p.entitlement_status === 'active').length;
  const graceCount = projects.filter((p) => p.entitlement_status === 'grace_period').length;
  const suspendedCount = projects.filter((p) => p.entitlement_status === 'suspended').length;

  return (
    <AppShell role="admin">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-primary)] bg-[var(--color-primary-subtle)] px-2.5 py-0.5 rounded-full border border-[var(--color-primary-light)]">
                Remote Governance
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Remote Entitlement Center
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Runtime authorization kill-switch and grace period management across all client applications.
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <MetricCard
            title="Active Deployments"
            value={activeCount.toString()}
            subvalue="Full runtime access"
            icon={<ShieldCheck className="h-5 w-5" />}
          />
          <MetricCard
            title="Grace Period Warnings"
            value={graceCount.toString()}
            change={graceCount > 0 ? 'Overdue milestone payment' : 'No warnings'}
            changeType={graceCount > 0 ? 'warning' : 'positive'}
            icon={<AlertTriangle className="h-5 w-5" />}
          />
          <MetricCard
            title="Suspended Codebases"
            value={suspendedCount.toString()}
            change={suspendedCount > 0 ? 'Access halted remotely' : 'Zero suspensions'}
            changeType={suspendedCount > 0 ? 'negative' : 'neutral'}
            icon={<ShieldAlert className="h-5 w-5" />}
          />
          <MetricCard
            title="Managed Apps"
            value={projects.length.toString()}
            subvalue="Total connected portfolio"
            icon={<FolderGit2 className="h-5 w-5" />}
          />
        </div>

        {/* Projects Entitlement Table */}
        <Card>
          <CardHeader
            title="Connected Projects Entitlement State"
            description="Control client runtime verification responses in real-time"
          />
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 text-center text-sm text-[var(--text-tertiary)]">
                Loading entitlement states...
              </div>
            ) : projects.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <FolderGit2 className="h-10 w-10 text-[var(--text-tertiary)] mx-auto" />
                <p className="text-sm font-medium text-[var(--text-secondary)]">No projects registered</p>
                <p className="text-xs text-[var(--text-tertiary)] max-w-sm mx-auto">
                  Register a project in Projects to enable remote entitlement control.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--bg-subtle)] border-y border-[var(--border-hairline)] text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                    <tr>
                      <th className="py-3 px-6 font-medium">Application Name</th>
                      <th className="py-3 px-6 font-medium">Client Account</th>
                      <th className="py-3 px-6 font-medium">Current State</th>
                      <th className="py-3 px-6 font-medium">Site ID</th>
                      <th className="py-3 px-6 font-medium text-right">Switch Remote State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-hairline)]">
                    {projects.map((proj) => (
                      <tr key={proj.id} className="hover:bg-[var(--bg-subtle)] transition">
                        <td className="py-4 px-6 font-medium text-[var(--text-primary)]">
                          <Link href={`/projects/${proj.id}`} className="hover:text-[var(--color-primary)]">
                            {proj.name}
                          </Link>
                        </td>
                        <td className="py-4 px-6 text-[var(--text-secondary)]">
                          {proj.clients?.business_name || 'LostGit Enterprise'}
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={proj.entitlement_status || 'active'} />
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-[var(--text-tertiary)]">
                          {proj.id.slice(0, 8)}...
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center gap-2">
                            {proj.entitlement_status !== 'active' && (
                              <Button
                                variant="primary"
                                size="sm"
                                icon={<Play className="h-3.5 w-3.5" />}
                                onClick={() => openStatusChangeModal(proj, 'active')}
                              >
                                Active
                              </Button>
                            )}
                            {proj.entitlement_status !== 'grace_period' && (
                              <Button
                                variant="outline"
                                size="sm"
                                icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                                onClick={() => openStatusChangeModal(proj, 'grace_period')}
                              >
                                Grace Period
                              </Button>
                            )}
                            {proj.entitlement_status !== 'suspended' && (
                              <Button
                                variant="danger"
                                size="sm"
                                icon={<Pause className="h-3.5 w-3.5" />}
                                onClick={() => openStatusChangeModal(proj, 'suspended')}
                              >
                                Suspend
                              </Button>
                            )}
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

        {/* Modal: Change Status */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`Update Entitlement State: ${targetStatus.toUpperCase()}`}
          description={`Change remote entitlement for '${selectedProject?.name}'. Client SDK heartbeat checks will immediately receive this updated status.`}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Audit Reason / Settlement Note *
              </label>
              <textarea
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for state transition (e.g., payment received, overdue milestone invoice, contract renewal)..."
                className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-hairline)]">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={targetStatus === 'suspended' ? 'danger' : 'primary'}
                isLoading={saving}
                onClick={handleApplyStatus}
              >
                Apply State Transition
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}
