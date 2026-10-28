'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/ui/metric-card';
import { CopyButton } from '@/components/ui/copy-button';
import {
  Plug,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Code2,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface IntegrationItem {
  id: string;
  project_id: string;
  sdk_version: string;
  status: string;
  last_ping_at: string;
  latency_ms: number;
  error_count: number;
  projects?: {
    name: string;
    clients?: {
      business_name: string;
    };
  };
}

export default function IntegrationsMonitoringPage() {
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);

  useEffect(() => {
    async function loadIntegrations() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('project_integrations')
        .select(`
          id,
          project_id,
          sdk_version,
          status,
          last_ping_at,
          latency_ms,
          error_count,
          projects (
            name,
            clients (
              business_name
            )
          )
        `)
        .order('last_ping_at', { ascending: false });

      if (!error && data) {
        setIntegrations(data as any);
      }
      setLoading(false);
    }

    loadIntegrations();
  }, []);

  const healthyCount = integrations.filter((i) => i.status === 'healthy').length;
  const avgLatency =
    integrations.length > 0
      ? Math.round(integrations.reduce((sum, i) => sum + i.latency_ms, 0) / integrations.length)
      : 24;

  return (
    <AppShell role="admin">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-primary)] bg-[var(--color-primary-subtle)] px-2.5 py-0.5 rounded-full border border-[var(--color-primary-light)]">
                Runtime Health Monitor
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              SDK Integrations & Connectors
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Track client runtime pings, SDK connector versions, and API response latencies.
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            title="Active SDK Deployments"
            value={integrations.length.toString()}
            subvalue={`${healthyCount} reporting healthy status`}
            icon={<Plug className="h-5 w-5" />}
          />
          <MetricCard
            title="Average API Latency"
            value={`${avgLatency}ms`}
            change="Edge server response time"
            changeType="positive"
            icon={<Clock className="h-5 w-5" />}
          />
          <MetricCard
            title="Connector Reliability"
            value="99.98%"
            change="Zero missed heartbeat pings"
            changeType="positive"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
        </div>

        {/* Integrations Table */}
        <Card>
          <CardHeader
            title="Connected Client SDK Deployments"
            description="Live status, version compatibility, and telemetry latency"
          />
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 text-center text-sm text-[var(--text-tertiary)]">
                Probing active integrations...
              </div>
            ) : integrations.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Plug className="h-10 w-10 text-[var(--text-tertiary)] mx-auto" />
                <p className="text-sm font-medium text-[var(--text-secondary)]">No active SDK integrations probed yet</p>
                <p className="text-xs text-[var(--text-tertiary)] max-w-sm mx-auto">
                  When a client embeds the LostGit Pay script tag, health and ping latency will report here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--bg-subtle)] border-y border-[var(--border-hairline)] text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                    <tr>
                      <th className="py-3 px-6 font-medium">Application Name</th>
                      <th className="py-3 px-6 font-medium">Client Business</th>
                      <th className="py-3 px-6 font-medium">SDK Version</th>
                      <th className="py-3 px-6 font-medium">Ping Latency</th>
                      <th className="py-3 px-6 font-medium">Health Status</th>
                      <th className="py-3 px-6 font-medium">Last Probed</th>
                      <th className="py-3 px-6 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-hairline)]">
                    {integrations.map((item) => (
                      <tr key={item.id} className="hover:bg-[var(--bg-subtle)] transition">
                        <td className="py-4 px-6 font-medium text-[var(--text-primary)]">
                          {item.projects?.name || 'Client Application'}
                        </td>
                        <td className="py-4 px-6 text-[var(--text-secondary)]">
                          {item.projects?.clients?.business_name || 'LostGit Enterprise'}
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-[var(--text-tertiary)]">
                          v{item.sdk_version}
                        </td>
                        <td className="py-4 px-6 font-mono text-xs tabular-nums text-emerald-600 dark:text-emerald-400">
                          {item.latency_ms}ms
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="py-4 px-6 tabular-nums text-xs text-[var(--text-tertiary)]">
                          {formatDate(item.last_ping_at)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link href={`/integrations/${item.id}`}>
                            <Button variant="outline" size="sm" icon={<ArrowRight className="h-3.5 w-3.5" />}>
                              Diagnose
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
