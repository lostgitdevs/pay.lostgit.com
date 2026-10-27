'use client';

import React, { useEffect, useState, use } from 'react';
import Script from 'next/script';
import { formatCurrency, formatDate } from '@/lib/utils';
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
          color: '#2563eb',
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <p className="text-slate-400 font-medium">Securing payment gateway connection...</p>
      </div>
    );
  }

  if (error && !invoice) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-red-900/50 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-950/80 border border-red-800 rounded-full flex items-center justify-center mx-auto mb-4 text-red-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Invoice Not Available</h2>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <a
            href="https://lostgit.com"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-sm font-semibold transition"
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

      <main className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header & Brand */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-lg">
                  L
                </div>
                <span className="text-xl font-bold tracking-tight text-white">LostGit Pay</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Official billing portal by LostGit Solutions
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>256-bit SSL Encrypted Checkout</span>
            </div>
          </div>

          {/* Error banner if payment attempt failed */}
          {error && (
            <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Payment Issue</p>
                <p className="text-xs text-red-300/80">{error}</p>
              </div>
            </div>
          )}

          {/* Paid Success Banner */}
          {paidSuccess ? (
            <div className="bg-gradient-to-b from-emerald-950/40 to-slate-900 border border-emerald-700/50 rounded-2xl p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-950/80 border border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white">Invoice Paid Successfully</h2>
              <p className="text-slate-300 text-sm max-w-md mx-auto">
                Thank you! Your payment has been confirmed and recorded.
                {receiptNumber && (
                  <span className="block mt-2 font-mono text-emerald-400 text-xs font-semibold">
                    Receipt #{receiptNumber}
                  </span>
                )}
              </p>
            </div>
          ) : null}

          {/* Invoice Summary Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {/* Card Header */}
            <div className="p-6 sm:p-8 border-b border-slate-800/80 flex flex-col sm:flex-row justify-between gap-6">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-md bg-blue-950 border border-blue-800 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
                  Invoice
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {invoice?.invoice_number}
                </h1>
                {invoice?.projects && (
                  <p className="text-sm text-slate-400 mt-1">Project: {invoice.projects.name}</p>
                )}
              </div>

              <div className="text-left sm:text-right space-y-1 text-xs text-slate-400">
                <div className="flex sm:justify-end items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Issued: {invoice ? formatDate(invoice.issue_date) : '-'}</span>
                </div>
                <div className="flex sm:justify-end items-center gap-1.5 font-medium text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Due: {invoice ? formatDate(invoice.due_date) : '-'}</span>
                </div>
              </div>
            </div>

            {/* Client and Billed-to details */}
            <div className="p-6 sm:p-8 bg-slate-900/50 border-b border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
                  Billed To
                </p>
                <div className="space-y-1">
                  <p className="font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    {invoice?.clients?.business_name}
                  </p>
                  <p className="text-slate-300">{invoice?.clients?.contact_name}</p>
                  <p className="text-slate-400 text-xs">{invoice?.clients?.email}</p>
                  {invoice?.clients?.tax_id && (
                    <p className="text-slate-400 text-xs font-mono">
                      GSTIN / PAN: {invoice.clients.tax_id}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
                  Payable To
                </p>
                <div className="space-y-1 text-slate-300">
                  <p className="font-bold text-white">LostGit Solutions</p>
                  <p className="text-xs text-slate-400">Billing Department</p>
                  <p className="text-xs text-slate-400">billing@lostgit.com</p>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="p-6 sm:p-8 border-b border-slate-800/80">
              <h3 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-4">
                Services & Deliverables
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs">
                      <th className="pb-3 font-medium">Description</th>
                      <th className="pb-3 text-right font-medium">Qty</th>
                      <th className="pb-3 text-right font-medium">Unit Price</th>
                      <th className="pb-3 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {invoice?.invoice_items?.map((item) => (
                      <tr key={item.id} className="text-slate-200">
                        <td className="py-3 font-medium">{item.description}</td>
                        <td className="py-3 text-right text-slate-400">{item.quantity}</td>
                        <td className="py-3 text-right text-slate-400">
                          {formatCurrency(item.unit_price_paise, invoice.currency)}
                        </td>
                        <td className="py-3 text-right font-semibold text-white">
                          {formatCurrency(item.total_paise, invoice.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="p-6 sm:p-8 bg-slate-950/40">
              <div className="max-w-xs ml-auto space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>
                    {invoice ? formatCurrency(invoice.subtotal_paise, invoice.currency) : '₹0'}
                  </span>
                </div>

                {invoice && invoice.discount_amount_paise > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span>-{formatCurrency(invoice.discount_amount_paise, invoice.currency)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-400">
                  <span>GST ({invoice?.tax_rate_percent || 18}%)</span>
                  <span>
                    {invoice ? formatCurrency(invoice.tax_amount_paise, invoice.currency) : '₹0'}
                  </span>
                </div>

                <div className="border-t border-slate-800 pt-3 flex justify-between font-bold text-white text-base">
                  <span>Total Amount</span>
                  <span>
                    {invoice ? formatCurrency(invoice.total_amount_paise, invoice.currency) : '₹0'}
                  </span>
                </div>

                {invoice && invoice.amount_paid_paise > 0 && (
                  <div className="flex justify-between text-slate-400 text-xs">
                    <span>Already Paid</span>
                    <span className="text-emerald-400">
                      -{formatCurrency(invoice.amount_paid_paise, invoice.currency)}
                    </span>
                  </div>
                )}

                {!paidSuccess && (
                  <div className="border-t border-slate-800/80 pt-3 flex justify-between font-extrabold text-blue-400 text-lg">
                    <span>Due Now</span>
                    <span>
                      {invoice ? formatCurrency(remainingPaise, invoice.currency) : '₹0'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            {!paidSuccess && (
              <div className="p-6 sm:p-8 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  <span>Supports UPI, Cards, NetBanking & Corporate Wallets</span>
                </div>

                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={paying || remainingPaise <= 0}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  {paying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
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
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-400">Terms & Policy</p>
              <p>{invoice.terms}</p>
            </div>
          )}

          {/* Footer */}
          <footer className="text-center text-xs text-slate-600 pt-6">
            <p>© {new Date().getFullYear()} LostGit Solutions. All rights reserved.</p>
            <p className="mt-1">
              For billing inquiries, contact us at{' '}
              <a href="mailto:billing@lostgit.com" className="text-blue-500 hover:underline">
                billing@lostgit.com
              </a>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
