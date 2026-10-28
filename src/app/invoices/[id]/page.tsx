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
import { CopyButton } from '@/components/ui/copy-button';
import {
  Receipt,
  ArrowLeft,
  Building2,
  Calendar,
  ExternalLink,
  Printer,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    async function loadInvoiceData() {
      if (!invoiceId) return;
      const supabase = createClient();

      const { data: invData, error: invErr } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (
            id,
            business_name,
            contact_name,
            email,
            phone,
            tax_id,
            billing_address
          ),
          projects (
            id,
            name
          )
        `)
        .eq('id', invoiceId)
        .single();

      if (invErr || !invData) {
        setLoading(false);
        return;
      }

      setInvoice(invData);

      // Fetch line items
      const { data: itemData } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('sort_order', { ascending: true });

      setItems(itemData || []);
      setLoading(false);
    }

    loadInvoiceData();
  }, [invoiceId]);

  if (loading) {
    return (
      <AppShell role="admin">
        <div className="py-24 text-center text-sm text-[var(--text-tertiary)] animate-pulse">
          Loading invoice details...
        </div>
      </AppShell>
    );
  }

  if (!invoice) {
    return (
      <AppShell role="admin">
        <div className="py-24 text-center space-y-4">
          <p className="text-lg font-semibold text-[var(--text-primary)]">Invoice not found</p>
          <Link href="/invoices">
            <Button variant="outline" icon={<ArrowLeft className="h-4 w-4" />}>
              Back to Invoices
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const payLink = typeof window !== 'undefined'
    ? `${window.location.origin}/pay/${invoice.payment_link_token}`
    : `/pay/${invoice.payment_link_token}`;

  const balanceDuePaise = Math.max(0, invoice.total_amount_paise - (invoice.amount_paid_paise || 0));

  return (
    <AppShell role="admin">
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Navigation & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href="/invoices"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Invoices Ledger
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Printer className="h-3.5 w-3.5" />}
              onClick={() => window.print()}
            >
              Print / PDF
            </Button>
            {invoice.payment_link_token && (
              <CopyButton text={payLink} label="Copy Checkout Link" copiedLabel="Link Copied!" />
            )}
            {invoice.payment_link_token && (
              <Link href={`/pay/${invoice.payment_link_token}`} target="_blank">
                <Button variant="primary" size="sm" icon={<ExternalLink className="h-3.5 w-3.5" />}>
                  Open Checkout
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Printable Invoice Card */}
        <div className="border border-[var(--border-hairline)] bg-[var(--surface-1)] rounded-2xl p-8 sm:p-10 shadow-sm print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 border-b border-[var(--border-hairline)] pb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-7 w-7 rounded-lg bg-[var(--color-primary)] flex items-center justify-center font-bold text-white text-sm">
                  L
                </div>
                <span className="font-bold text-lg tracking-tight text-[var(--text-primary)]">
                  LostGit Solutions
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">Enterprise Software & Cloud Platforms</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1 font-mono">GSTIN: 29AAAAA0000A1Z5</p>
              <p className="text-xs text-[var(--text-tertiary)]">Bengaluru, Karnataka, India</p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs uppercase font-semibold text-[var(--text-tertiary)]">Tax Invoice</span>
              <div className="text-2xl font-mono font-bold text-[var(--text-primary)] mt-1">
                {invoice.invoice_number}
              </div>
              <div className="mt-2">
                <StatusBadge status={invoice.status} />
              </div>
            </div>
          </div>

          {/* Dates & Client Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-[var(--border-hairline)]">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-[var(--text-tertiary)]">
                Billed To:
              </span>
              <h2 className="text-base font-semibold text-[var(--text-primary)] mt-1">
                {invoice.clients?.business_name || 'Client Business'}
              </h2>
              <div className="text-xs text-[var(--text-secondary)] space-y-0.5 mt-1">
                <p>Attn: {invoice.clients?.contact_name || 'Accounts Payable'}</p>
                <p>{invoice.clients?.email}</p>
                {invoice.clients?.tax_id && (
                  <p className="font-mono text-[var(--text-tertiary)]">GSTIN: {invoice.clients.tax_id}</p>
                )}
              </div>
            </div>

            <div className="sm:text-right space-y-2 text-xs">
              <div>
                <span className="text-[var(--text-tertiary)]">Issue Date:</span>{' '}
                <span className="font-mono tabular-nums text-[var(--text-primary)] font-medium">
                  {formatDate(invoice.issue_date || invoice.created_at)}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-tertiary)]">Payment Due:</span>{' '}
                <span className="font-mono tabular-nums text-[var(--text-primary)] font-medium">
                  {formatDate(invoice.due_date)}
                </span>
              </div>
              {invoice.projects?.name && (
                <div>
                  <span className="text-[var(--text-tertiary)]">Project:</span>{' '}
                  <span className="text-[var(--color-primary)] font-medium">
                    {invoice.projects.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Itemized Line Items Table */}
          <div className="py-6">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5">Deliverable Description</th>
                  <th className="py-2.5 text-center">Qty</th>
                  <th className="py-2.5 text-right">Unit Rate</th>
                  <th className="py-2.5 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-hairline)] text-[var(--text-primary)]">
                {items.length === 0 ? (
                  <tr>
                    <td className="py-4 font-medium">Professional Software Development & Milestone Services</td>
                    <td className="py-4 text-center tabular-nums">1.00</td>
                    <td className="py-4 text-right font-mono tabular-nums">
                      {formatCurrency(invoice.subtotal_paise || invoice.total_amount_paise, invoice.currency)}
                    </td>
                    <td className="py-4 text-right font-mono tabular-nums font-semibold">
                      {formatCurrency(invoice.subtotal_paise || invoice.total_amount_paise, invoice.currency)}
                    </td>
                  </tr>
                ) : (
                  items.map((it) => (
                    <tr key={it.id}>
                      <td className="py-4 font-medium">{it.description}</td>
                      <td className="py-4 text-center tabular-nums">{Number(it.quantity).toFixed(2)}</td>
                      <td className="py-4 text-right font-mono tabular-nums">
                        {formatCurrency(it.unit_price_paise, invoice.currency)}
                      </td>
                      <td className="py-4 text-right font-mono tabular-nums font-semibold">
                        {formatCurrency(it.total_paise, invoice.currency)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Calculation Ledger */}
          <div className="border-t border-[var(--border-hairline)] pt-4 flex justify-end">
            <div className="w-full sm:w-72 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Subtotal:</span>
                <span className="tabular-nums">
                  {formatCurrency(invoice.subtotal_paise || invoice.total_amount_paise, invoice.currency)}
                </span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>GST ({invoice.tax_rate_percent}%):</span>
                <span className="tabular-nums">
                  {formatCurrency(invoice.tax_amount_paise || 0, invoice.currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[var(--text-primary)] border-t border-[var(--border-hairline)] pt-2">
                <span>Total Amount:</span>
                <span className="tabular-nums">
                  {formatCurrency(invoice.total_amount_paise, invoice.currency)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400">
                <span>Amount Paid:</span>
                <span className="tabular-nums">
                  {formatCurrency(invoice.amount_paid_paise || 0, invoice.currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[var(--color-primary)] border-t border-[var(--border-hairline)] pt-2">
                <span>Balance Due:</span>
                <span className="tabular-nums">
                  {formatCurrency(balanceDuePaise, invoice.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Terms & Footer */}
          <div className="mt-12 pt-6 border-t border-[var(--border-hairline)] text-xs text-[var(--text-tertiary)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Razorpay Verified Payment Gateway &bull; LostGit Pay Engine</span>
            </div>
            <div className="font-mono">
              Token: {invoice.payment_link_token ? invoice.payment_link_token.slice(0, 16) + '...' : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
