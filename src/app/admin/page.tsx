'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Users,
  Receipt,
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  LogOut,
  FolderGit2,
  Copy,
  Check,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const [stats, setStats] = useState({
    totalInvoicedPaise: 0,
    totalCollectedPaise: 0,
    outstandingPaise: 0,
    clientsCount: 0,
  });

  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [recentClients, setRecentClients] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    async function loadAdminData() {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Check role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || !['owner', 'admin', 'finance', 'support'].includes(profile.role)) {
        router.push('/portal');
        return;
      }

      // Load Invoices
      const { data: invoices } = await supabase
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
          clients (
            business_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      // Load Clients
      const { data: clients, count: clientCount } = await supabase
        .from('clients')
        .select('id, business_name, email, status, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(5);

      // Load Audit logs
      const { data: logs } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      const invList = invoices || [];
      const totalInvoiced = invList.reduce((sum, inv) => sum + inv.total_amount_paise, 0);
      const totalCollected = invList.reduce((sum, inv) => sum + inv.amount_paid_paise, 0);
      const outstanding = Math.max(0, totalInvoiced - totalCollected);

      setStats({
        totalInvoicedPaise: totalInvoiced,
        totalCollectedPaise: totalCollected,
        outstandingPaise: outstanding,
        clientsCount: clientCount || (clients || []).length,
      });

      setRecentInvoices(invList);
      setRecentClients(clients || []);
      setRecentLogs(logs || []);
      setLoading(false);
    }

    loadAdminData();
  }, [router]);

  const copyPaymentLink = (token: string) => {
    const url = `${window.location.origin}/pay/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <p className="animate-pulse">Loading Admin Financial Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/90 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-base">
              L
            </div>
            <div>
              <span className="font-bold tracking-tight text-white">LostGit Pay</span>
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider ml-2 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800/80">
                Admin Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-white transition"
            >
              Public Home
            </Link>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span>Total Invoiced</span>
              <DollarSign className="w-4 h-4 text-blue-400" />
            </div>
            <p className="mt-3 text-2xl font-extrabold text-white">
              {formatCurrency(stats.totalInvoicedPaise)}
            </p>
            <p className="text-xs text-slate-500 mt-1">Calculated in integer paise</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span>Total Collected</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="mt-3 text-2xl font-extrabold text-emerald-400">
              {formatCurrency(stats.totalCollectedPaise)}
            </p>
            <p className="text-xs text-slate-500 mt-1">Verified via Razorpay / AutoPay</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span>Outstanding Due</span>
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
            <p className="mt-3 text-2xl font-extrabold text-amber-400">
              {formatCurrency(stats.outstandingPaise)}
            </p>
            <p className="text-xs text-slate-500 mt-1">Pending client reconciliation</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span>Active Clients</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="mt-3 text-2xl font-extrabold text-white">
              {stats.clientsCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">Registered business entities</p>
          </div>
        </div>

        {/* Invoices Table */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-400" />
              <span>Recent Invoices & Payment Links</span>
            </h2>
          </div>

          {recentInvoices.length === 0 ? (
            <p className="text-slate-500 text-sm py-4">No invoices created yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs">
                    <th className="pb-3 font-semibold">Invoice #</th>
                    <th className="pb-3 font-semibold">Client</th>
                    <th className="pb-3 font-semibold">Due Date</th>
                    <th className="pb-3 font-semibold">Total Amount</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 text-right font-semibold">Payment Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 font-mono font-bold text-white">
                        {inv.invoice_number}
                      </td>
                      <td className="py-3 text-slate-300">
                        {inv.clients?.business_name || 'Direct Client'}
                      </td>
                      <td className="py-3 text-slate-400">
                        {formatDate(inv.due_date)}
                      </td>
                      <td className="py-3 font-medium text-white">
                        {formatCurrency(inv.total_amount_paise, inv.currency)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            inv.status === 'paid'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : inv.status === 'overdue'
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {inv.payment_link_token && (
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => copyPaymentLink(inv.payment_link_token)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition cursor-pointer"
                              title="Copy Payment Link"
                            >
                              {copiedToken === inv.payment_link_token ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-400 font-semibold">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy Link</span>
                                </>
                              )}
                            </button>
                            <Link
                              href={`/pay/${inv.payment_link_token}`}
                              target="_blank"
                              className="text-slate-400 hover:text-white transition"
                              title="Open Payment Link"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Audit Log Activity */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
            <span>Recent Financial & Security Audit Events</span>
          </h2>

          {recentLogs.length === 0 ? (
            <p className="text-slate-500 text-sm">No audit activity logged yet.</p>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {recentLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-semibold text-blue-400">
                      {log.action}
                    </span>
                    <span className="text-slate-400 ml-2">
                      Entity: {log.entity_type} {log.entity_id ? `(#${log.entity_id.slice(0, 8)})` : ''}
                    </span>
                  </div>
                  <span className="text-slate-500">
                    {formatDate(log.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
