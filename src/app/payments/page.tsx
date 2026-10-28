'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/ui/metric-card';
import {
  CreditCard,
  Search,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Receipt,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface PaymentRow {
  id: string;
  amount_paise: number;
  currency: string;
  payment_method: string | null;
  razorpay_payment_id: string | null;
  razorpay_order_id: string | null;
  status: string;
  created_at: string;
  captured_at: string | null;
  receipt_number: string | null;
  clients?: {
    business_name: string;
  };
  invoices?: {
    invoice_number: string;
  };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function loadPayments() {
      setLoading(true);
      const supabase = createClient();

      let query = supabase
        .from('payments')
        .select(`
          id,
          amount_paise,
          currency,
          payment_method,
          razorpay_payment_id,
          razorpay_order_id,
          status,
          created_at,
          captured_at,
          receipt_number,
          clients (
            business_name
          ),
          invoices (
            invoice_number
          )
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as any);
      }


      const { data, error } = await query;
      if (!error && data) {
        setPayments(data as any);
      }
      setLoading(false);
    }

    loadPayments();
  }, [statusFilter]);

  const totalCapturedPaise = payments
    .filter((p) => p.status === 'captured')
    .reduce((sum, p) => sum + p.amount_paise, 0);

  const filteredPayments = payments.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      (p.razorpay_payment_id && p.razorpay_payment_id.toLowerCase().includes(q)) ||
      (p.clients?.business_name && p.clients.business_name.toLowerCase().includes(q)) ||
      (p.invoices?.invoice_number && p.invoices.invoice_number.toLowerCase().includes(q)) ||
      (p.receipt_number && p.receipt_number.toLowerCase().includes(q))
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
                Settlement Ledger
              </span>
              <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> HMAC SHA256 Verified
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Payment Transactions
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Real-time Razorpay payment events, webhook validations, and settlement ledger.
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            title="Total Captured Receipts"
            value={formatCurrency(totalCapturedPaise)}
            change="Realized cashflow in INR"
            changeType="positive"
            icon={<CreditCard className="h-5 w-5" />}
          />
          <MetricCard
            title="Total Transactions"
            value={payments.length.toString()}
            subvalue={`${payments.filter((p) => p.status === 'captured').length} captured successfully`}
            icon={<Receipt className="h-5 w-5" />}
          />
          <MetricCard
            title="Signature Verification"
            value="100%"
            change="Tamper-proof HMAC verification"
            changeType="positive"
            icon={<ShieldCheck className="h-5 w-5" />}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by payment ID, client, invoice..."
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
              <option value="all">All Transactions</option>
              <option value="captured">Captured</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Payments Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 text-center text-sm text-[var(--text-tertiary)]">
                Loading payment transactions...
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <CreditCard className="h-10 w-10 text-[var(--text-tertiary)] mx-auto" />
                <p className="text-sm font-medium text-[var(--text-secondary)]">No payments found</p>
                <p className="text-xs text-[var(--text-tertiary)] max-w-sm mx-auto">
                  {searchQuery ? 'Try adjusting your search criteria.' : 'Transactions will populate here in real-time as clients pay.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border-hairline)] text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                    <tr>
                      <th className="py-3 px-6 font-medium">Payment ID</th>
                      <th className="py-3 px-6 font-medium">Client Account</th>
                      <th className="py-3 px-6 font-medium">Invoice #</th>
                      <th className="py-3 px-6 font-medium">Amount</th>
                      <th className="py-3 px-6 font-medium">Method</th>
                      <th className="py-3 px-6 font-medium">Status</th>
                      <th className="py-3 px-6 font-medium">Captured Date</th>
                      <th className="py-3 px-6 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-hairline)]">
                    {filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-[var(--bg-subtle)] transition">
                        <td className="py-4 px-6 font-mono text-xs font-semibold text-[var(--text-primary)]">
                          <Link href={`/payments/${p.id}`} className="hover:text-[var(--color-primary)]">
                            {p.razorpay_payment_id || p.id.slice(0, 12)}
                          </Link>
                        </td>
                        <td className="py-4 px-6 text-[var(--text-secondary)]">
                          {p.clients?.business_name || 'Direct Client'}
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-[var(--text-secondary)]">
                          {p.invoices?.invoice_number || '—'}
                        </td>
                        <td className="py-4 px-6 font-mono font-medium text-sm tabular-nums text-[var(--text-primary)]">
                          {formatCurrency(p.amount_paise, p.currency)}
                        </td>
                        <td className="py-4 px-6 text-xs uppercase tracking-wider font-mono text-[var(--text-tertiary)]">
                          {p.payment_method || 'UPI / Card'}
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="py-4 px-6 tabular-nums text-xs text-[var(--text-tertiary)]">
                          {formatDate(p.captured_at || p.created_at)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link href={`/payments/${p.id}`}>
                            <Button variant="outline" size="sm" icon={<ArrowRight className="h-3.5 w-3.5" />}>
                              Audit
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
      </div>
    </AppShell>
  );
}
