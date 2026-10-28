'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import {
  Users,
  Plus,
  Search,
  Building2,
  Mail,
  Phone,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface ClientItem {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  tax_id: string | null;
  status: string;
  created_at: string;
  projects?: { count: number }[];
}

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    business_name: '',
    contact_name: '',
    email: '',
    phone: '',
    tax_id: '',
    notes: '',
  });

  const loadClients = async () => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from('clients')
      .select('id, business_name, contact_name, email, phone, tax_id, status, created_at')
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter as any);
    }


    const { data, error } = await query;
    if (!error && data) {
      setClients(data as ClientItem[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadClients();
  }, [statusFilter]);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    if (!formData.business_name.trim() || !formData.email.trim() || !formData.contact_name.trim()) {
      setFormError('Business name, contact name, and email are required.');
      setSaving(false);
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('clients')
      .insert([
        {
          business_name: formData.business_name.trim(),
          contact_name: formData.contact_name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          tax_id: formData.tax_id.trim() || null,
          notes: formData.notes.trim() || null,
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

    setIsModalOpen(false);
    setFormData({
      business_name: '',
      contact_name: '',
      email: '',
      phone: '',
      tax_id: '',
      notes: '',
    });
    setSaving(false);
    loadClients();
  };

  const filteredClients = clients.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.business_name.toLowerCase().includes(q) ||
      c.contact_name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.tax_id && c.tax_id.toLowerCase().includes(q))
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
                Accounts Ledger
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Clients Directory
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Enterprise accounts, billing profiles, and contact registries.
            </p>
          </div>

          <Button
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Add New Client
          </Button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by business name, contact, GSTIN..."
              className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg pl-10 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-[var(--text-tertiary)] uppercase font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3 py-2 text-xs font-medium text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="invited">Invited</option>
            </select>
          </div>
        </div>

        {/* Clients Table Card */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 text-center text-sm text-[var(--text-tertiary)]">
                Loading accounts directory...
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Building2 className="h-10 w-10 text-[var(--text-tertiary)] mx-auto" />
                <p className="text-sm font-medium text-[var(--text-secondary)]">No clients found</p>
                <p className="text-xs text-[var(--text-tertiary)] max-w-sm mx-auto">
                  {searchQuery ? 'Try adjusting your search filters.' : 'Get started by creating your first client account profile.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border-hairline)] text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                    <tr>
                      <th className="py-3 px-6 font-medium">Business / Entity</th>
                      <th className="py-3 px-6 font-medium">Primary Contact</th>
                      <th className="py-3 px-6 font-medium">GSTIN / Tax ID</th>
                      <th className="py-3 px-6 font-medium">Status</th>
                      <th className="py-3 px-6 font-medium">Created Date</th>
                      <th className="py-3 px-6 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-hairline)]">
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-[var(--bg-subtle)] transition">
                        <td className="py-4 px-6 font-medium text-[var(--text-primary)]">
                          <Link
                            href={`/clients/${client.id}`}
                            className="hover:text-[var(--color-primary)] flex items-center gap-2 group"
                          >
                            <Building2 className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--color-primary)] transition" />
                            <span className="font-semibold">{client.business_name}</span>
                          </Link>
                        </td>
                        <td className="py-4 px-6 text-[var(--text-secondary)]">
                          <div className="text-xs font-medium text-[var(--text-primary)]">{client.contact_name}</div>
                          <div className="text-xs text-[var(--text-tertiary)] flex items-center gap-1 mt-0.5">
                            <Mail className="h-3 w-3" />
                            {client.email}
                          </div>
                        </td>
                        <td className="py-4 px-6 font-mono text-xs tabular-nums text-[var(--text-secondary)]">
                          {client.tax_id || '—'}
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={client.status} />
                        </td>
                        <td className="py-4 px-6 tabular-nums text-xs text-[var(--text-tertiary)]">
                          {formatDate(client.created_at)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link href={`/clients/${client.id}`}>
                            <Button variant="outline" size="sm" icon={<ArrowRight className="h-3.5 w-3.5" />}>
                              Manage
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

        {/* Modal: Create Client */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add New Client Account"
          description="Register an enterprise client profile for contracts, invoicing, and telemetry."
        >
          <form onSubmit={handleCreateClient} className="space-y-4">
            {formError && (
              <div className="p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Business Name *
              </label>
              <input
                type="text"
                required
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                placeholder="Acme Corporation Pvt Ltd"
                className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Primary Contact Person *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  placeholder="Jane Doe"
                  className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="billing@acme.com"
                  className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  GSTIN / PAN (Optional)
                </label>
                <input
                  type="text"
                  value={formData.tax_id}
                  onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                  placeholder="29AAAAA0000A1Z5"
                  className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Internal Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Contract terms, onboarding contacts, specific invoicing instructions..."
                className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-hairline)]">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={saving}>
                Create Client
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
