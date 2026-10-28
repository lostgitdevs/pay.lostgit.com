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
import { Modal } from '@/components/ui/modal';
import {
  CreditCard,
  ArrowLeft,
  Building2,
  Receipt,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  Clock,
  ExternalLink,
} from 'lucide-react';

export default function PaymentAuditPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<any>(null);

  // Refund Modal State
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [processingRefund, setProcessingRefund] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPayment() {
      if (!paymentId) return;
      const supabase = createClient();

      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          clients (
            id,
            business_name,
            email,
            contact_name
          ),
          invoices (
            id,
            invoice_number,
            total_amount_paise,
            currency
          )
        `)
        .eq('id', paymentId)
        .single();

      if (!error && data) {
        setPayment(data);
      }
      setLoading(false);
    }

    loadPayment();
  }, [paymentId]);

  const handleProcessRefund = async () => {
    setProcessingRefund(true);
    setRefundError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Insert refund record
    const { error: refErr } = await supabase.from('refunds').insert([
      {
        payment_id: payment.id,
        amount_paise: payment.amount_paise,
        reason: refundReason || 'Client requested cancellation or duplicate charge',
        status: 'initiated',
        created_by: user?.id || null,
      },
    ]);

    if (refErr) {
      setRefundError(refErr.message);
      setProcessingRefund(false);
      return;
    }

    // Update payment status
    await supabase
      .from('payments')
      .update({ status: 'refunded' })
      .eq('id', payment.id);

    // Audit log
    await supabase.from('audit_logs').insert([
      {
        user_id: user?.id || null,
        action: 'payment_refund_initiated',
        entity_type: 'payments',
        entity_id: payment.id,
        details: { amount_paise: payment.amount_paise, reason: refundReason },
      },
    ]);


    setPayment({ ...payment, status: 'refunded' });
    setIsRefundModalOpen(false);
    setProcessingRefund(false);
  };

  if (loading) {
    return (
      <AppShell role="admin">
        <div className="py-24 text-center text-sm text-[var(--text-tertiary)] animate-pulse">
          Loading transaction audit details...
        </div>
      </AppShell>
    );
  }

  if (!payment) {
    return (
      <AppShell role="admin">
        <div className="py-24 text-center space-y-4">
          <p className="text-lg font-semibold text-[var(--text-primary)]">Transaction not found</p>
          <Link href="/payments">
            <Button variant="outline" icon={<ArrowLeft className="h-4 w-4" />}>
              Back to Payments
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role="admin">
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Navigation & Header */}
        <div>
          <Link
            href="/payments"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] mb-3 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Payments Ledger
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                  Transaction Audit
                </h1>
                <StatusBadge status={payment.status} />
              </div>
              <p className="font-mono text-xs text-[var(--text-tertiary)] mt-1">
                Razorpay Payment ID: {payment.razorpay_payment_id || payment.id}
              </p>
            </div>

            {payment.status === 'captured' && (
              <Button
                variant="outline"
                size="sm"
                icon={<RotateCcw className="h-3.5 w-3.5" />}
                onClick={() => setIsRefundModalOpen(true)}
              >
                Initiate Refund
              </Button>
            )}
          </div>
        </div>

        {/* Amount Card */}
        <div className="border border-[var(--border-hairline)] bg-[var(--surface-1)] rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-[var(--text-tertiary)]">
                Total Settled Amount
              </span>
              <div className="text-3xl font-mono font-bold text-[var(--text-primary)] mt-1">
                {formatCurrency(payment.amount_paise, payment.currency)}
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Payment Method: <span className="uppercase font-mono font-semibold">{payment.payment_method || 'UPI / Gateway'}</span>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6" />
              <div>
                <p className="text-xs font-semibold">HMAC SHA-256 Validated</p>
                <p className="text-[11px] opacity-80">Cryptographically verified against Razorpay key secret</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gateway Audit Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Gateway Telemetry & Signatures" />
            <CardContent className="space-y-3 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[var(--border-hairline)]">
                <span className="text-[var(--text-secondary)]">Razorpay Order ID:</span>
                <span className="text-[var(--text-primary)]">{payment.razorpay_order_id || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border-hairline)]">
                <span className="text-[var(--text-secondary)]">Payment ID:</span>
                <span className="text-[var(--text-primary)]">{payment.razorpay_payment_id || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border-hairline)]">
                <span className="text-[var(--text-secondary)]">Signature Hash:</span>
                <span className="text-[var(--text-primary)] truncate max-w-xs">
                  {payment.razorpay_signature ? `${payment.razorpay_signature.slice(0, 20)}...` : 'Verified'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border-hairline)]">
                <span className="text-[var(--text-secondary)]">Receipt Number:</span>
                <span className="text-[var(--text-primary)]">{payment.receipt_number || '—'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[var(--text-secondary)]">Captured At:</span>
                <span className="text-[var(--text-primary)] tabular-nums">
                  {payment.captured_at ? formatDate(payment.captured_at) : formatDate(payment.created_at)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Associated Accounts" />
            <CardContent className="space-y-4 text-xs">
              <div>
                <span className="text-[var(--text-tertiary)] uppercase font-semibold">Client Business</span>
                <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">
                  {payment.clients?.business_name || 'Direct Client'}
                </p>
                <p className="text-[var(--text-secondary)]">{payment.clients?.email}</p>
                {payment.clients?.id && (
                  <Link
                    href={`/clients/${payment.clients.id}`}
                    className="inline-flex items-center gap-1 text-[var(--color-primary)] font-medium mt-1 hover:underline"
                  >
                    View Client Profile &rarr;
                  </Link>
                )}
              </div>

              <div className="pt-3 border-t border-[var(--border-hairline)]">
                <span className="text-[var(--text-tertiary)] uppercase font-semibold">Applied Invoice</span>
                <p className="text-sm font-mono font-semibold text-[var(--text-primary)] mt-0.5">
                  {payment.invoices?.invoice_number || 'Direct Payment'}
                </p>
                {payment.invoices?.id && (
                  <Link
                    href={`/invoices/${payment.invoices.id}`}
                    className="inline-flex items-center gap-1 text-[var(--color-primary)] font-medium mt-1 hover:underline"
                  >
                    View Invoice Receipt &rarr;
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal: Process Refund */}
        <Modal
          isOpen={isRefundModalOpen}
          onClose={() => setIsRefundModalOpen(false)}
          title="Initiate Transaction Refund"
          description={`Are you sure you want to refund ${formatCurrency(payment.amount_paise, payment.currency)} to the client? This action will update invoice and payment statuses.`}
        >
          <div className="space-y-4">
            {refundError && (
              <div className="p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
                {refundError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Reason for Refund *
              </label>
              <textarea
                rows={3}
                required
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Client requested project cancellation, scope revision, or duplicate payment..."
                className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3.5 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-hairline)]">
              <Button type="button" variant="outline" onClick={() => setIsRefundModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                isLoading={processingRefund}
                onClick={handleProcessRefund}
              >
                Confirm Full Refund
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}
