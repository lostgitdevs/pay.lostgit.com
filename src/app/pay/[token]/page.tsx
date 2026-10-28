'use client';

import React, { useEffect, useState, use } from 'react';
import Script from 'next/script';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { StatusBadge } from '@/components/ui/badge';
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building2,
  Calendar,
  CreditCard,
  Receipt,
  ArrowRight,
  Loader2,
  Zap,
} from 'lucide-react';

interface InvoiceData {
  id: string;
  invoice_number: string;
  invoice_type: string;
  status: string;
  subtotal_paise: number;
  tax_rate_percent: number;
  tax_amount_paise: number;
  discount_amount_paise: number;
  total_amount_paise: number;
  amount_paid_paise: number;
  currency: string;
  issue_date: string;
  due_date: string;
  payment_link_expires_at: string | null;
  notes: string | null;
  terms: string | null;
  clients: {
    business_name: string;
    contact_name: string;
    email: string;
    phone: string | null;
    billing_address: any;
    tax_id: string | null;
  };
  projects?: {
    name: string;
    project_type: string;
  };
  invoice_items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price_paise: number;
    total_paise: number;
  }>;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [remainingPaise, setRemainingPaise] = useState(0);
  const [paidSuccess, setPaidSuccess] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/pay/${token}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch invoice details');
        }

        setInvoice(data.invoice);
        setRemainingPaise(data.remainingPaise || 0);
        if (data.alreadyPaid || data.invoice?.status === 'paid') {
          setPaidSuccess(true);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchInvoice();
    }
  }, [token]);

  const handlePayment = async () => {
    if (!invoice || paying) return;

    try {
      setPaying(true);
      setError(null);

      // 1. Create order on server
      const orderRes = await fetch(`/api/pay/${token}/order`, {
        method: 'POST',
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Unable to initialize payment');
      }

      // 2. Open Razorpay Checkout modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amountPaise,
        currency: orderData.currency,
        name: 'LostGit Solutions',
        description: `Invoice ${invoice.invoice_number}`,
        order_id: orderData.orderId,
        prefill: {
          name: invoice.clients?.contact_name || invoice.clients?.business_name,
          email: invoice.clients?.email,
          contact: invoice.clients?.phone || '',
        },
        theme: {
          color: '#6D5EF5', // Electric Violet token
        },
        handler: async function (response: any) {
          // 3. Verify payment signature on server
          try {
            const verifyRes = await fetch(`/api/pay/${token}/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || 'Payment signature verification failed');
            }

            setPaidSuccess(true);
            setReceiptNumber(verifyData.receiptNumber);
            setRemainingPaise(0);
          } catch (verifyErr: any) {
            setError(verifyErr.message);
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPaying(false);
          },
        },
      };

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please refresh and try again.');
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (failResponse: any) {
        setError(`Payment failed: ${failResponse.error?.description || 'Transaction declined'}`);
        setPaying(false);
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message);
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-canvas)] flex flex-col items-center justify-center text-[var(--text-primary)] p-4">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)] mb-4" />
        <p className="text-[var(--text-secondary)] font-medium text-sm">Securing payment checkout portal...</p>
      </div>
    );
  }

  if (error && !invoice) {
    return (
      <div className="min-h-screen bg-[var(--bg-canvas)] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-[var(--surface-1)] border border-red-500/20 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Invoice Not Available</h2>
          <p className="text-[var(--text-secondary)] text-sm mb-6">{error}</p>
          <a
            href="https://lostgit.com"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)] text-[var(--text-primary)] hover:border-[var(--color-primary)] text-sm font-semibold transition"
          >
            Visit LostGit Solutions
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <main className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header & Brand */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[var(--border-hairline)] gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center font-bold text-white text-base">
                  L
                </div>
                <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                  LostGit Pay
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Official billing and milestone payment portal by LostGit Solutions
              </p>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface-1)] border border-[var(--border-hairline)] text-xs text-[var(--text-secondary)]">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>256-bit SSL Verified</span>
              </div>
            </div>
          </div>

          {/* Error banner if payment attempt failed */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Payment Notification</p>
                <p className="text-xs opacity-90">{error}</p>
              </div>
            </div>
          )}

          {/* Paid Success Banner */}
          {paidSuccess ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Invoice Paid Successfully</h2>
              <p className="text-[var(--text-secondary)] text-sm max-w-md mx-auto">
                Thank you! Your payment has been confirmed and verified against the gateway.
                {receiptNumber && (
                  <span className="block mt-2 font-mono text-emerald-500 text-xs font-semibold">
                    Settlement Receipt #{receiptNumber}
                  </span>
                )}
              </p>
            </div>
          ) : null}

          {/* Invoice Summary Card */}
          <div className="bg-[var(--surface-1)] border border-[var(--border-hairline)] rounded-2xl overflow-hidden shadow-sm">
            {/* Card Header */}
            <div className="p-6 sm:p-8 border-b border-[var(--border-hairline)] flex flex-col sm:flex-row justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-[var(--color-primary-subtle)] border border-[var(--color-primary-light)] text-[var(--color-primary)] text-xs font-semibold uppercase tracking-wider">
                    Tax Invoice
                  </span>
                  <StatusBadge status={paidSuccess ? 'paid' : (invoice?.status || 'issued')} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-mono font-extrabold text-[var(--text-primary)]">
                  {invoice?.invoice_number}
                </h1>
                {invoice?.projects && (
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Application / Deliverable: <strong className="text-[var(--text-primary)]">{invoice.projects.name}</strong>
                  </p>
                )}
              </div>

              <div className="text-left sm:text-right space-y-1 text-xs text-[var(--text-secondary)] font-mono">
                <div className="flex sm:justify-end items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                  <span>Issued: {invoice ? formatDate(invoice.issue_date) : '-'}</span>
                </div>
                <div className="flex sm:justify-end items-center gap-1.5 font-medium text-amber-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Due: {invoice ? formatDate(invoice.due_date) : '-'}</span>
                </div>
              </div>
            </div>

            {/* Billed-to details */}
            <div className="p-6 sm:p-8 bg-[var(--bg-subtle)] border-b border-[var(--border-hairline)] grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div>
                <p className="uppercase tracking-wider text-[var(--text-tertiary)] font-semibold mb-2">
                  Billed To
                </p>
                <div className="space-y-1">
                  <p className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[var(--color-primary)]" />
                    {invoice?.clients?.business_name}
                  </p>
                  <p className="text-[var(--text-secondary)]">{invoice?.clients?.contact_name}</p>
                  <p className="text-[var(--text-tertiary)]">{invoice?.clients?.email}</p>
                  {invoice?.clients?.tax_id && (
                    <p className="font-mono text-[var(--text-tertiary)]">
                      GSTIN / PAN: {invoice.clients.tax_id}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <p className="uppercase tracking-wider text-[var(--text-tertiary)] font-semibold mb-2">
                  Beneficiary
                </p>
                <div className="space-y-1 text-[var(--text-secondary)]">
                  <p className="font-bold text-sm text-[var(--text-primary)]">LostGit Solutions</p>
                  <p className="text-[var(--text-tertiary)] font-mono">GSTIN: 29AAAAA0000A1Z5</p>
                  <p className="text-[var(--text-tertiary)]">billing@lostgit.com</p>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="p-6 sm:p-8 border-b border-[var(--border-hairline)]">
              <h3 className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-semibold mb-4">
                Milestones & Deliverables
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border-hairline)] text-[var(--text-secondary)] font-medium">
                      <th className="pb-3">Description</th>
                      <th className="pb-3 text-center">Qty</th>
                      <th className="pb-3 text-right">Unit Rate</th>
                      <th className="pb-3 text-right">Total (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-hairline)]">
                    {invoice?.invoice_items?.map((item) => (
                      <tr key={item.id} className="text-[var(--text-primary)]">
                        <td className="py-3.5 font-medium">{item.description}</td>
                        <td className="py-3.5 text-center tabular-nums text-[var(--text-secondary)]">{item.quantity}</td>
                        <td className="py-3.5 text-right font-mono tabular-nums text-[var(--text-secondary)]">
                          {formatCurrency(item.unit_price_paise, invoice.currency)}
                        </td>
                        <td className="py-3.5 text-right font-mono tabular-nums font-semibold">
                          {formatCurrency(item.total_paise, invoice.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="p-6 sm:p-8 bg-[var(--bg-subtle)]">
              <div className="max-w-xs ml-auto space-y-2 text-xs font-mono">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Subtotal:</span>
                  <span className="tabular-nums">
                    {invoice ? formatCurrency(invoice.subtotal_paise, invoice.currency) : '₹0'}
                  </span>
                </div>

                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>GST ({invoice?.tax_rate_percent || 18}%):</span>
                  <span className="tabular-nums">
                    {invoice ? formatCurrency(invoice.tax_amount_paise, invoice.currency) : '₹0'}
                  </span>
                </div>

                <div className="border-t border-[var(--border-hairline)] pt-2.5 flex justify-between font-bold text-sm text-[var(--text-primary)]">
                  <span>Total Amount:</span>
                  <span className="tabular-nums">
                    {invoice ? formatCurrency(invoice.total_amount_paise, invoice.currency) : '₹0'}
                  </span>
                </div>

                {invoice && invoice.amount_paid_paise > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Already Settled:</span>
                    <span className="tabular-nums">
                      -{formatCurrency(invoice.amount_paid_paise, invoice.currency)}
                    </span>
                  </div>
                )}

                {!paidSuccess && (
                  <div className="border-t border-[var(--border-hairline)] pt-2.5 flex justify-between font-extrabold text-[var(--color-primary)] text-base">
                    <span>Payable Now:</span>
                    <span className="tabular-nums">
                      {invoice ? formatCurrency(remainingPaise, invoice.currency) : '₹0'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            {!paidSuccess && (
              <div className="p-6 sm:p-8 bg-[var(--surface-1)] border-t border-[var(--border-hairline)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <CreditCard className="w-4 h-4 text-[var(--color-primary)]" />
                  <span>Supports UPI, Cards, NetBanking & Corporate Wallets</span>
                </div>

                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={paying || remainingPaise <= 0}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] active:scale-[0.99] disabled:opacity-50 text-white font-bold text-sm shadow-md transition cursor-pointer"
                >
                  {paying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Connecting Gateway...</span>
                    </>
                  ) : (
                    <>
                      <span>Pay {invoice ? formatCurrency(remainingPaise, invoice.currency) : ''}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Terms & Conditions Note */}
          {invoice?.terms && (
            <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border-hairline)] text-xs text-[var(--text-tertiary)] space-y-1">
              <p className="font-semibold text-[var(--text-secondary)]">Terms & Conditions</p>
              <p>{invoice.terms}</p>
            </div>
          )}

          {/* Footer */}
          <footer className="text-center text-xs text-[var(--text-tertiary)] pt-6">
            <p>© 2026 LostGit Solutions. All rights reserved.</p>
            <p className="mt-1">
              For billing inquiries, contact us at{' '}
              <a href="mailto:billing@lostgit.com" className="text-[var(--color-primary)] hover:underline">
                billing@lostgit.com
              </a>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
