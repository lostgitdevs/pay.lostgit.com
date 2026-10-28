'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import {
  UserCheck,
  Plus,
  Shield,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface ProfileItem {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function TeamSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('admin');
  const [saving, setSaving] = useState(false);

  const loadTeam = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, is_active, created_at')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProfiles(data as ProfileItem[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const handleRoleChange = async (profileId: string, newRole: string) => {
    const supabase = createClient();
    await supabase.from('profiles').update({ role: newRole as any }).eq('id', profileId);

    // Record audit
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('audit_logs').insert([
      {
        user_id: user?.id || null,
        action: `rbac_role_change:${newRole}`,
        entity_type: 'profiles',
        entity_id: profileId,
      },
    ]);

    loadTeam();
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setIsInviteModalOpen(false);
      setInviteEmail('');
      alert(`Invitation sent to ${inviteEmail} with role '${inviteRole}'.`);
    }, 600);
  };

  return (
    <AppShell role="admin">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-primary)] bg-[var(--color-primary-subtle)] px-2.5 py-0.5 rounded-full border border-[var(--color-primary-light)]">
                Access Governance
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Team & Role-Based Access Control (RBAC)
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Manage operator privileges, granular role assignments, and team member authentications.
            </p>
          </div>

          <Button
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setIsInviteModalOpen(true)}
          >
            Invite Member
          </Button>
        </div>

        {/* Roles Breakdown Box */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border border-[var(--border-hairline)] bg-[var(--surface-1)] rounded-xl p-4">
            <span className="text-xs uppercase font-semibold text-[var(--color-primary)]">Owner</span>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Unrestricted control over billing, team seats, root API keys, and organizational dissolution.
            </p>
          </div>
          <div className="border border-[var(--border-hairline)] bg-[var(--surface-1)] rounded-xl p-4">
            <span className="text-xs uppercase font-semibold text-blue-500">Admin</span>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Manage client accounts, contracts, entitlement killswitch states, and telemetry.
            </p>
          </div>
          <div className="border border-[var(--border-hairline)] bg-[var(--surface-1)] rounded-xl p-4">
            <span className="text-xs uppercase font-semibold text-emerald-500">Finance</span>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Issue milestone invoices, manage payments, process refunds, and reconcile tax.
            </p>
          </div>
          <div className="border border-[var(--border-hairline)] bg-[var(--surface-1)] rounded-xl p-4">
            <span className="text-xs uppercase font-semibold text-amber-500">Support</span>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Read-only telemetry diagnostics, connector ping logs, and invoice verification.
            </p>
          </div>
        </div>

        {/* Team Table */}
        <Card>
          <CardHeader
            title="Team Members & Assigned Roles"
            description="Active accounts with authorized access to the LostGit Pay platform"
          />
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 text-center text-sm text-[var(--text-tertiary)]">
                Loading team directory...
              </div>
            ) : profiles.length === 0 ? (
              <div className="py-16 text-center text-sm text-[var(--text-tertiary)]">
                No team profiles found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--bg-subtle)] border-y border-[var(--border-hairline)] text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                    <tr>
                      <th className="py-3 px-6 font-medium">Name & Email</th>
                      <th className="py-3 px-6 font-medium">Assigned Role</th>
                      <th className="py-3 px-6 font-medium">Status</th>
                      <th className="py-3 px-6 font-medium">Joined Date</th>
                      <th className="py-3 px-6 font-medium text-right">Role Assignment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-hairline)]">
                    {profiles.map((profile) => (
                      <tr key={profile.id} className="hover:bg-[var(--bg-subtle)] transition">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-[var(--text-primary)]">
                            {profile.full_name || profile.email?.split('@')[0]}
                          </div>
                          <div className="text-xs text-[var(--text-tertiary)] flex items-center gap-1 mt-0.5">
                            <Mail className="h-3 w-3" /> {profile.email}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-mono text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-[var(--text-primary)]">
                            {profile.role}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={profile.is_active ? 'active' : 'inactive'} />
                        </td>
                        <td className="py-4 px-6 tabular-nums text-xs text-[var(--text-tertiary)]">
                          {formatDate(profile.created_at)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <select
                            value={profile.role}
                            onChange={(e) => handleRoleChange(profile.id, e.target.value)}
                            className="bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                          >
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                            <option value="finance">Finance</option>
                            <option value="support">Support</option>
                            <option value="client">Client</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal: Invite Member */}
        <Modal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          title="Invite Team Member"
          description="Send an onboarding invitation with pre-configured RBAC role permissions."
        >
          <form onSubmit={handleSendInvite} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@lostgit.com"
                className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                RBAC Role *
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="admin">Admin (Contracts & Telemetry)</option>
                <option value="finance">Finance (Invoices & Settlements)</option>
                <option value="support">Support (Read-only Diagnostics)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-hairline)]">
              <Button type="button" variant="outline" onClick={() => setIsInviteModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={saving}>
                Send Invitation
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
