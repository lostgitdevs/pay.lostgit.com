'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  Activity,
  Eye,
  Users,
  MousePointerClick,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Power,
  Copy,
  Check,
  Code2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface AnalyticsData {
  project: {
    id: string;
    name: string;
    entitlement_status: string;
    status: string;
    licence_key?: string;
  };
  summary: {
    totalEvents: number;
    pageviewsCount: number;
    uniqueVisitors: number;
    clicksCount: number;
    averageDurationSeconds: number;
  };
  topPages: Array<{ path: string; count: number }>;
  topClicks: Array<{ label: string; count: number }>;
  integration: {
    status: string;
    last_ping_at: string | null;
    sdk_version?: string;
  };
}

export default function ProjectAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [copied, setCopied] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/v1/analytics/stats?projectId=${projectId}`);
      if (!res.ok) {
        throw new Error('Failed to load project analytics');
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [projectId]);

  const handleStatusChange = async (newStatus: 'active' | 'grace_period' | 'suspended') => {
    if (!data || updatingStatus) return;
    setUpdatingStatus(true);
    try {
      const supabase = createClient();
      await supabase
        .from('projects')
        .update({
          entitlement_status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);

      // Log audit
      await supabase.from('audit_logs').insert({
        action: `project.entitlement.${newStatus}`,
        entity_type: 'project',
        entity_id: projectId,
        details: { previous: data.project.entitlement_status, new: newStatus },
      });

      setData({
        ...data,
        project: {
          ...data.project,
          entitlement_status: newStatus,
        },
      });
    } catch (err) {
      console.error('Failed to update entitlement:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const trackingTag = `<script defer src="https://pay.lostgit.com/sdk/lostgit-analytics.js" data-project-key="${data?.project?.licence_key || data?.project?.id}"></script>`;

  const copySnippet = () => {
    navigator.clipboard.writeText(trackingTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <p className="animate-pulse">Loading analytics telemetry...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/90 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-bold text-white text-base">
                {data?.project?.name} — Telemetry & Entitlement
              </h1>
              <p className="text-xs text-slate-500">Live Website Traffic & Service Controls</p>
            </div>
          </div>

          <button
            onClick={fetchStats}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Remote Control / Entitlement Card */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Power className="w-4 h-4 text-blue-400" />
              <h2 className="font-bold text-white text-base">Service Entitlement & Remote State</h2>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Control client software service authorization in real-time. Overdue accounts can be placed into grace period or suspended.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold uppercase text-slate-400">Current State:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                data?.project?.entitlement_status === 'active'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : data?.project?.entitlement_status === 'grace_period'
                  ? 'bg-amber-950 text-amber-400 border border-amber-800'
                  : 'bg-red-950 text-red-400 border border-red-800'
              }`}
            >
              {data?.project?.entitlement_status || 'Active'}
            </span>

            <div className="flex items-center gap-1.5 ml-2">
              <button
                onClick={() => handleStatusChange('active')}
                disabled={updatingStatus || data?.project?.entitlement_status === 'active'}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-emerald-900/50 hover:text-emerald-300 disabled:opacity-40 transition cursor-pointer"
              >
                Activate
              </button>
              <button
                onClick={() => handleStatusChange('grace_period')}
                disabled={updatingStatus || data?.project?.entitlement_status === 'grace_period'}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-amber-900/50 hover:text-amber-300 disabled:opacity-40 transition cursor-pointer"
              >
                Grace Period
              </button>
              <button
                onClick={() => handleStatusChange('suspended')}
                disabled={updatingStatus || data?.project?.entitlement_status === 'suspended'}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-red-900/50 hover:text-red-300 disabled:opacity-40 transition cursor-pointer"
              >
                Suspend
              </button>
            </div>
          </div>
        </section>

        {/* SDK Installation Snippet */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-white text-sm">Website Analytics Embed Tag</h3>
            </div>
            <button
              onClick={copySnippet}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Embed Code</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Paste this snippet into the client website&apos;s HTML &lt;head&gt; or before &lt;/body&gt;.
          </p>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-blue-300 overflow-x-auto select-all">
            {trackingTag}
          </div>
        </section>

        {/* Telemetry Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span>Total Page Views</span>
              <Eye className="w-4 h-4 text-blue-400" />
            </div>
            <p className="mt-3 text-3xl font-extrabold text-white">
              {data?.summary?.pageviewsCount || 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">Recorded via lostgit-analytics.js</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span>Unique Visitors</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="mt-3 text-3xl font-extrabold text-emerald-400">
              {data?.summary?.uniqueVisitors || 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">Daily rotating pseudo-hash (DPDP)</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span>Click Interactions</span>
              <MousePointerClick className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="mt-3 text-3xl font-extrabold text-indigo-400">
              {data?.summary?.clicksCount || 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">Buttons, navigation & data-track</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span>Avg. Time on Page</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="mt-3 text-3xl font-extrabold text-amber-400">
              {data?.summary?.averageDurationSeconds || 0}s
            </p>
            <p className="text-xs text-slate-500 mt-1">Heartbeat beacon telemetry</p>
          </div>
        </div>

        {/* Tables: Top Visited Pages & Top Clicked Elements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-sm">Top Visited Pages</h3>
            {!data?.topPages || data.topPages.length === 0 ? (
              <p className="text-xs text-slate-500">No pageview telemetry recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {data.topPages.map((page, idx) => (
                  <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                    <span className="font-mono text-slate-300 truncate max-w-[240px]">
                      {page.path}
                    </span>
                    <span className="font-bold text-blue-400">{page.count} views</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-sm">Top Clicked Elements</h3>
            {!data?.topClicks || data.topClicks.length === 0 ? (
              <p className="text-xs text-slate-500">No click interactions recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {data.topClicks.map((click, idx) => (
                  <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                    <span className="text-slate-300 truncate max-w-[240px]">
                      {click.label}
                    </span>
                    <span className="font-bold text-indigo-400">{click.count} clicks</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
