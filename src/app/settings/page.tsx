'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Settings,
  Building2,
  Mail,
  Phone,
  Globe,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  Save,
} from 'lucide-react';

export default function GeneralSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    company_name: 'LostGit Solutions',
    company_email: 'billing@lostgit.com',
    company_phone: '+91 99999 99999',
    company_website: 'https://lostgit.com',
    gstin: '29AAAAA0000A1Z5',
    pan: 'AAAAA0000A',
    default_tax_rate: 18,
    invoice_prefix: 'INV',
    default_payment_terms_days: 15,
    default_grace_period_days: 7,
    default_terms: 'Payment is due within the stipulated period. Late payments may attract service suspension after grace period.',
  });

  useEffect(() => {
    async function loadSettings() {
      const supabase = createClient();
      const { data } = await supabase.from('business_settings').select('*').eq('id', 1).single();
      if (data) {
        setForm({
          company_name: data.company_name || 'LostGit Solutions',
          company_email: data.company_email || 'billing@lostgit.com',
          company_phone: data.company_phone || '+91 99999 99999',
          company_website: data.company_website || 'https://lostgit.com',
          gstin: data.gstin || '29AAAAA0000A1Z5',
          pan: data.pan || 'AAAAA0000A',
          default_tax_rate: data.default_tax_rate || 18,
          invoice_prefix: data.invoice_prefix || 'INV',
          default_payment_terms_days: data.default_payment_terms_days || 15,
          default_grace_period_days: data.default_grace_period_days || 7,
          default_terms: data.default_terms || '',
        });
      }
      setLoading(false);
    }

    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccess(false);

    const supabase = createClient();
    const { error } = await supabase
      .from('business_settings')
      .update(form)
      .eq('id', 1);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  };

  return (
    <AppShell role="admin">
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-primary)] bg-[var(--color-primary-subtle)] px-2.5 py-0.5 rounded-full border border-[var(--color-primary-light)]">
                Organization Profile
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Business & Billing Settings
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Legal company information, GSTIN tax identifiers, and default invoicing policies.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMsg && (
            <div className="p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
              {errorMsg}
            </div>
          )}

          {success && (
            <div className="p-3 text-xs rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Settings successfully updated.
            </div>
          )}

          {/* Company Identity Card */}
          <Card>
            <CardHeader
              title="Legal Entity & Contact"
              description="Appears directly on generated PDF invoices and client checkout pages"
            />
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.company_name}
                    onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    Billing Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={form.company_email}
                    onChange={(e) => setForm({ ...form, company_email: e.target.value })}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={form.company_phone}
                    onChange={(e) => setForm({ ...form, company_phone: e.target.value })}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    Official Website URL
                  </label>
                  <input
                    type="url"
                    value={form.company_website}
                    onChange={(e) => setForm({ ...form, company_website: e.target.value })}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Indian Taxation Identifiers */}
          <Card>
            <CardHeader
              title="Taxation & Invoicing Defaults"
              description="Indian Goods and Services Tax (GST) registration credentials"
            />
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    GSTIN
                  </label>
                  <input
                    type="text"
                    value={form.gstin}
                    onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    PAN
                  </label>
                  <input
                    type="text"
                    value={form.pan}
                    onChange={(e) => setForm({ ...form, pan: e.target.value })}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    Default GST Rate (%)
                  </label>
                  <input
                    type="number"
                    value={form.default_tax_rate}
                    onChange={(e) => setForm({ ...form, default_tax_rate: Number(e.target.value) })}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-mono tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    Payment Terms (Days)
                  </label>
                  <input
                    type="number"
                    value={form.default_payment_terms_days}
                    onChange={(e) => setForm({ ...form, default_payment_terms_days: Number(e.target.value) })}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-mono tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    Grace Period (Days)
                  </label>
                  <input
                    type="number"
                    value={form.default_grace_period_days}
                    onChange={(e) => setForm({ ...form, default_grace_period_days: Number(e.target.value) })}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-mono tabular-nums"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" icon={<Save className="h-4 w-4" />} isLoading={saving}>
              Save Business Profile
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
