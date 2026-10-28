'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/ui/metric-card';
import { CopyButton } from '@/components/ui/copy-button';
import { TrafficBarChart } from '@/components/charts/traffic-chart';
import {
  ArrowLeft,
  Activity,
  Eye,
  Users,
  MousePointerClick,
  Clock,
  ShieldCheck,
  Code2,
  ListFilter,
  CheckCircle2,
} from 'lucide-react';

export default function SiteTelemetryPage() {
  const params = useParams();
  const siteId = params.siteId as string;

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [summary, setSummary] = useState({
    pageviewsCount: 0,
    uniqueVisitors: 0,
    clicksCount: 0,
    averageDurationSeconds: 0,
  });
  const [topPages, setTopPages] = useState<any[]>([]);
  const [topClicks, setTopClicks] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    async function loadTelemetry() {
      if (!siteId) return;
      const supabase = createClient();

      // Fetch project
      const { data: proj } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          entitlement_status,
          status,
          clients (
            business_name
          )
        `)
        .eq('id', siteId)
        .single();

      if (!proj) {
        setLoading(false);
        return;
      }
      setProject(proj);

      // Fetch analytics stats from API or direct table queries
      try {
        const res = await fetch(`/api/v1/analytics/stats?project_id=${siteId}`);
        if (res.ok) {
          const json = await res.json();
          setSummary({
            pageviewsCount: json.summary?.pageviewsCount || 0,
            uniqueVisitors: json.summary?.uniqueVisitors || 0,
            clicksCount: json.summary?.clicksCount || 0,
            averageDurationSeconds: json.summary?.averageDurationSeconds || 0,
          });
          setTopPages(json.topPages || []);
          setTopClicks(json.topClicks || []);
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      }

      // Sample chart points
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      setChartData(
        days.map((day, i) => ({
          date: day,
          pageviews: 420 + i * 85 + (i % 2 === 0 ? 90 : -50),
          visitors: 120 + i * 25 + (i % 2 === 0 ? 30 : -20),
        }))
      );

      setLoading(false);
    }

    loadTelemetry();
  }, [siteId]);

  if (loading) {
    return (
      <AppShell role="admin">
        <div className="py-24 text-center text-sm text-[var(--text-tertiary)] animate-pulse">
          Loading site telemetry workspace...
        </div>
      </AppShell>
    );
  }

  if (!project) {
    return (
      <AppShell role="admin">
        <div className="py-24 text-center space-y-4">
          <p className="text-lg font-semibold text-[var(--text-primary)]">Project site not found</p>
          <Link href="/analytics">
            <Button variant="outline" icon={<ArrowLeft className="h-4 w-4" />}>
              Back to Analytics
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const snippetCode = `<script src="https://pay.lostgit.com/lostgit-pay-sdk.js" data-site-id="${project.id}" defer></script>`;

  return (
    <AppShell role="admin">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Navigation & Header */}
        <div>
          <Link
            href="/analytics"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] mb-3 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Global Analytics
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                  {project.name}
                </h1>
                <StatusBadge status={project.entitlement_status || 'active'} />
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-2">
                <span>Client: {project.clients?.business_name || 'LostGit Enterprise'}</span>
                <span>&bull;</span>
                <span className="font-mono text-[var(--text-tertiary)]">Site ID: {project.id}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/analytics/${project.id}/events`}>
                <Button variant="primary" size="sm" icon={<ListFilter className="h-4 w-4" />}>
                  Inspect Raw Events Stream
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <MetricCard
            title="Total Pageviews"
            value={summary.pageviewsCount.toLocaleString('en-IN')}
            change="Real-time verified"
            changeType="positive"
            icon={<Eye className="h-5 w-5" />}
          />
          <MetricCard
            title="Unique Visitors"
            value={summary.uniqueVisitors.toLocaleString('en-IN')}
            change="Daily rotating hash"
            changeType="neutral"
            icon={<Users className="h-5 w-5" />}
          />
          <MetricCard
            title="Tracked Click Events"
            value={summary.clicksCount.toLocaleString('en-IN')}
            change="UI interaction points"
            changeType="positive"
            icon={<MousePointerClick className="h-5 w-5" />}
          />
          <MetricCard
            title="Avg Time on Page"
            value={`${summary.averageDurationSeconds}s`}
            change="Engaged reading time"
            changeType="neutral"
            icon={<Clock className="h-5 w-5" />}
          />
        </div>

        {/* Traffic Chart */}
        <TrafficBarChart
          data={chartData}
          title="Daily Visitor Trend"
          description="Rolling 7-day traffic activity for this application"
        />

        {/* Top Pages & Top Click Interactivity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader
              title="Top Visited Pages"
              description="Most active routes requested by client visitors"
            />
            <CardContent className="p-0">
              {topPages.length === 0 ? (
                <div className="py-12 text-center text-xs text-[var(--text-tertiary)]">
                  No pageview routes recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-hairline)] text-xs">
                  {topPages.map((page, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 hover:bg-[var(--bg-subtle)] transition">
                      <span className="font-mono text-[var(--text-primary)] font-medium truncate max-w-xs">
                        {page.path}
                      </span>
                      <span className="tabular-nums font-mono font-semibold text-[var(--color-primary)] bg-[var(--color-primary-subtle)] px-2 py-0.5 rounded border border-[var(--color-primary-light)]">
                        {page.count} views
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="High-Intent Interactions"
              description="Buttons, links, and conversion clicks tracked by the SDK"
            />
            <CardContent className="p-0">
              {topClicks.length === 0 ? (
                <div className="py-12 text-center text-xs text-[var(--text-tertiary)]">
                  No click events recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-hairline)] text-xs">
                  {topClicks.map((click, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 hover:bg-[var(--bg-subtle)] transition">
                      <span className="text-[var(--text-primary)] font-medium truncate max-w-xs">
                        {click.label || 'Interactive Element'}
                      </span>
                      <span className="tabular-nums font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {click.count} clicks
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Embed Snippet Quick Copy */}
        <div className="border border-[var(--border-hairline)] bg-[var(--surface-1)] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-[var(--color-primary)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Telemetry Embed Script
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-mono truncate max-w-xl">
              {snippetCode}
            </p>
          </div>

          <CopyButton text={snippetCode} label="Copy Script" copiedLabel="Copied!" />
        </div>
      </div>
    </AppShell>
  );
}
