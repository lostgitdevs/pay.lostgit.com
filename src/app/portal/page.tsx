'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Building2,
  Receipt,
  FolderGit2,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  LogOut,
  ShieldCheck,
  Zap,
  Key,
} from 'lucide-react';

export default function ClientPortalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  useEffect(() => {
    async function loadClientData() {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(userProfile);

      if (userProfile?.client_id) {
        const { data: clientData } = await supabase
          .from('clients')
          .select('*')
          .eq('id', userProfile.client_id)
          .single();
        setClient(clientData);

        const { data: clientProjects } = await supabase
          .from('projects')
          .select('*')
          .eq('client_id', userProfile.client_id);
        setProjects(clientProjects || []);

        const { data: clientInvoices } = await supabase
          .from('invoices')
          .select('*')
          .eq('client_id', userProfile.client_id)
          .order('created_at', { ascending: false });
        setInvoices(clientInvoices || []);

        const { data: clientSubs } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('client_id', userProfile.client_id);
        setSubscriptions(clientSubs || []);
      }

      setLoading(false);
    }

    loadClientData();
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <p className="animate-pulse">Loading Client Portal...</p>
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
              <span className="text-xs text-slate-500 ml-2">Client Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 hidden sm:inline-block">
              {profile?.full_name} ({client?.business_name || 'Client'})
            </span>
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
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {client?.business_name || 'Your Client Portal'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              View milestone invoices, maintenance agreements, and licence entitlements.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 border border-slate-800 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Account in Good Standing</span>
          </div>
        </div>

        {/* Invoices Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-400" />
              <span>Invoices & Billing</span>
            </h2>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            {invoices.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No invoices issued yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs">
                      <th className="p-4 font-semibold">Invoice #</th>
                      <th className="p-4 font-semibold">Due Date</th>
                      <th className="p-4 font-semibold">Total Amount</th>
                      <th className="p-4 font-semibold">Balance Due</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {invoices.map((inv) => {
                      const remaining = Math.max(0, inv.total_amount_paise - inv.amount_paid_paise);
                      const isPaid = inv.status === 'paid' || remaining === 0;

                      return (
                        <tr key={inv.id} className="hover:bg-slate-800/30 transition">
                          <td className="p-4 font-mono font-bold text-white">
                            {inv.invoice_number}
                          </td>
                          <td className="p-4 text-slate-300">
                            {formatDate(inv.due_date)}
                          </td>
                          <td className="p-4 font-medium text-slate-200">
                            {formatCurrency(inv.total_amount_paise, inv.currency)}
                          </td>
                          <td className="p-4 font-semibold text-white">
                            {isPaid ? (
                              <span className="text-emerald-400">Paid in Full</span>
                            ) : (
                              formatCurrency(remaining, inv.currency)
                            )}
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                isPaid
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : inv.status === 'overdue'
                                  ? 'bg-red-950 text-red-400 border border-red-800'
                                  : 'bg-amber-950 text-amber-400 border border-amber-800'
                              }`}
                            >
                              {inv.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {inv.payment_link_token && (
                              <Link
                                href={`/pay/${inv.payment_link_token}`}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                  isPaid
                                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30'
                                }`}
                              >
                                <span>{isPaid ? 'View Invoice' : 'Pay Now'}</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Projects & Entitlement Keys Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-indigo-400" />
            <span>Active Projects & Licence Keys</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm bg-slate-900 border border-slate-800 rounded-2xl col-span-2">
                No active projects registered yet.
              </div>
            ) : (
              projects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-white text-base">{proj.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5 capitalize">
                        Type: {proj.project_type.replace('_', ' ')}
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950 border border-blue-800 text-blue-400 capitalize">
                      {proj.status}
                    </span>
                  </div>

                  {proj.licence_key && (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-amber-400" />
                          <span>Licence Key</span>
                        </span>
                        <span className="text-emerald-400 font-medium capitalize">
                          {proj.entitlement_status}
                        </span>
                      </div>
                      <p className="font-mono text-xs font-bold text-slate-200 select-all">
                        {proj.licence_key}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
