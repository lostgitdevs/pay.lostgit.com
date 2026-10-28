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
import { CopyButton } from '@/components/ui/copy-button';
import { Modal } from '@/components/ui/modal';
import {
  Receipt,
  Plus,
  Search,
  ExternalLink,
  Trash2,
  Calendar,
  Building2,
  CheckCircle2,
} from 'lucide-react';

interface InvoiceRow {
  id: string;
  invoice_number: string;
  total_amount_paise: number;
  amount_paid_paise: number;
  status: string;
  due_date: string;
  currency: string;
  payment_link_token: string;
  client_id: string;
  clients?: {
    business_name: string;
  };
}

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    client_id: '',
    project_id: '',
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tax_rate_percent: 18,
    items: [
      { description: 'Phase 1: Milestone Deliverable & Cloud Deployment', quantity: 1, unit_price_inr: 50000 },
    ],
  });

  const loadData = async () => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from('invoices')
      .select(`
        id,
        invoice_number,
        total_amount_paise,
        amount_paid_paise,
        status,
        due_date,
        currency,
        payment_link_token,
        client_id,
        clients (
          business_name
        )
      `)
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter as any);
    }


    const { data: invs } = await query;
    if (invs) setInvoices(invs as any);

    const { data: cls } = await supabase.from('clients').select('id, business_name').order('business_name');
    if (cls) setClients(cls);

    const { data: prjs } = await supabase.from('projects').select('id, name, client_id').order('name');
    if (prjs) setProjects(prjs);

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unit_price_inr: 0 }],
    });
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length <= 1) return;
    const updated = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updated });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...formData.items];
    (updated[index] as any)[field] = value;
    setFormData({ ...formData, items: updated });
  };

  // Calculations
  const subtotalINR = formData.items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price_inr) || 0),
    0
  );
  const taxINR = Math.round((subtotalINR * (formData.tax_rate_percent || 0)) / 100);
  const totalINR = subtotalINR + taxINR;

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    if (!formData.client_id) {
      setFormError('Please select a client account.');
      setSaving(false);
      return;
    }

    if (formData.items.length === 0 || !formData.items[0].description) {
      setFormError('At least one item with a valid description is required.');
      setSaving(false);
      return;
    }

    const supabase = createClient();

    // Generate random invoice number & token
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${new Date().getFullYear()}-${randomSuffix}`;
    const paymentLinkToken = `lgp_tok_${Math.random().toString(36).substring(2, 12)}${Date.now().toString(36)}`;

    const subtotalPaise = Math.round(subtotalINR * 100);
    const taxPaise = Math.round(taxINR * 100);
    const totalPaise = Math.round(totalINR * 100);

    const { data: newInv, error: invErr } = await supabase
      .from('invoices')
      .insert([
        {
          invoice_number: invoiceNumber,
          client_id: formData.client_id,
          project_id: formData.project_id || null,
          invoice_type: 'one_time',
          status: 'issued',
          subtotal_paise: subtotalPaise,
          tax_rate_percent: formData.tax_rate_percent,
          tax_amount_paise: taxPaise,
          total_amount_paise: totalPaise,
          amount_paid_paise: 0,
          currency: 'INR',
          due_date: formData.due_date,
          payment_link_token: paymentLinkToken,
        },
      ])
      .select()
      .single();

    if (invErr || !newInv) {
      setFormError(invErr?.message || 'Failed to create invoice.');
      setSaving(false);
      return;
    }

    // Insert line items
    const lineItemInserts = formData.items.map((it, idx) => {
      const lineUnitPaise = Math.round((Number(it.unit_price_inr) || 0) * 100);
      const lineTotalPaise = Math.round(lineUnitPaise * (Number(it.quantity) || 1));
      return {
        invoice_id: newInv.id,
        description: it.description,
        quantity: Number(it.quantity) || 1,
        unit_price_paise: lineUnitPaise,
        total_paise: lineTotalPaise,
        sort_order: idx,
      };
    });

    await supabase.from('invoice_items').insert(lineItemInserts);

    setIsModalOpen(false);
    setSaving(false);
    loadData();
  };

  const filteredInvoices = invoices.filter((inv) => {
    const q = searchQuery.toLowerCase();
    return (
      inv.invoice_number.toLowerCase().includes(q) ||
      (inv.clients?.business_name && inv.clients.business_name.toLowerCase().includes(q))
    );
  });

  return (
    <AppShell role="admin">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-primary)] bg-[var(--color-primary-subtle)] px-2.5 py-0.5 rounded-full border border-[var(--color-primary-light)]">
                Financial Operations
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Invoices & Billing Ledger
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Issue verified milestone invoices with Indian GST calculations and client checkout tokens.
            </p>
          </div>

          <Button
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Issue New Invoice
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
              placeholder="Search by invoice # or client..."
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
              <option value="all">All Invoices</option>
              <option value="issued">Issued / Unpaid</option>
              <option value="paid">Paid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="overdue">Overdue</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Invoices Table Card */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 text-center text-sm text-[var(--text-tertiary)]">
                Loading invoices ledger...
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Receipt className="h-10 w-10 text-[var(--text-tertiary)] mx-auto" />
                <p className="text-sm font-medium text-[var(--text-secondary)]">No invoices found</p>
                <p className="text-xs text-[var(--text-tertiary)] max-w-sm mx-auto">
                  {searchQuery ? 'Try clearing your search query.' : 'Click "Issue New Invoice" to generate your first bill.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border-hairline)] text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                    <tr>
                      <th className="py-3 px-6 font-medium">Invoice Number</th>
                      <th className="py-3 px-6 font-medium">Client Business</th>
                      <th className="py-3 px-6 font-medium">Total Amount</th>
                      <th className="py-3 px-6 font-medium">Paid Amount</th>
                      <th className="py-3 px-6 font-medium">Status</th>
                      <th className="py-3 px-6 font-medium">Due Date</th>
                      <th className="py-3 px-6 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-hairline)]">
                    {filteredInvoices.map((inv) => {
                      const payLink = typeof window !== 'undefined'
                        ? `${window.location.origin}/pay/${inv.payment_link_token}`
                        : `/pay/${inv.payment_link_token}`;

                      return (
                        <tr key={inv.id} className="hover:bg-[var(--bg-subtle)] transition">
                          <td className="py-4 px-6 font-mono text-xs font-semibold text-[var(--text-primary)]">
                            <Link href={`/invoices/${inv.id}`} className="hover:text-[var(--color-primary)]">
                              {inv.invoice_number}
                            </Link>
                          </td>
                          <td className="py-4 px-6 text-[var(--text-secondary)]">
                            {inv.clients?.business_name || 'Client'}
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

        {/* Modal: Issue Invoice */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Issue New Client Invoice"
          description="Itemized milestone invoice with Indian GST calculation and checkout link."
        >
          <form onSubmit={handleCreateInvoice} className="space-y-4">
            {formError && (
              <div className="p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  Associated Project (Optional)
                </label>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="">None / General</option>
                  {projects
                    .filter((p) => !formData.client_id || p.client_id === formData.client_id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  GST Rate (%):
                </label>
                <select
                  value={formData.tax_rate_percent}
                  onChange={(e) => setFormData({ ...formData, tax_rate_percent: Number(e.target.value) })}
                  className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-mono"
                >
                  <option value={18}>18% (Standard GST - SGST/CGST or IGST)</option>
                  <option value={12}>12%</option>
                  <option value={5}>5%</option>
                  <option value={0}>0% (Export of Services / SEZ Exemption)</option>
                </select>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Invoice Line Items
              </label>

              {formData.items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Deliverable description"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="flex-1 bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-16 bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-2 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] tabular-nums"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Rate (INR)"
                    value={item.unit_price_inr}
                    onChange={(e) => handleItemChange(index, 'unit_price_inr', e.target.value)}
                    className="w-28 bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-2 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] tabular-nums font-mono"
                  />
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-1.5 text-red-500 hover:bg-red-500/10 rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={<Plus className="h-3.5 w-3.5" />}
                onClick={handleAddItem}
              >
                Add Line Item
              </Button>
            </div>

            {/* Calculations Summary */}
            <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Subtotal:</span>
                <span className="tabular-nums">₹{subtotalINR.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>GST ({formData.tax_rate_percent}%):</span>
                <span className="tabular-nums">₹{taxINR.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[var(--text-primary)] border-t border-[var(--border-hairline)] pt-1.5">
                <span>Total Amount:</span>
                <span className="tabular-nums">₹{totalINR.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-hairline)]">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={saving}>
                Generate Invoice
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
