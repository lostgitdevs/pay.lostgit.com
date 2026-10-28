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
import { Modal } from '@/components/ui/modal';
import {
  ArrowLeft,
  ListFilter,
  Search,
  ShieldCheck,
  MousePointerClick,
  Eye,
  Activity,
  Smartphone,
  Monitor,
  RefreshCw,
} from 'lucide-react';

interface AnalyticsEventRow {
  id: string;
  event_type: string;
  path: string;
  title: string | null;
  referrer: string | null;
  device_category: string | null;
  browser: string | null;
  duration_seconds: number;
  element_tag: string | null;
  element_text: string | null;
  visitor_hash: string;
  created_at: string;
  metadata: any;
}

export default function EventsExplorerPage() {
  const params = useParams();
  const siteId = params.siteId as string;

  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<AnalyticsEventRow[]>([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [searchPath, setSearchPath] = useState('');

  // JSON Inspector Modal
  const [selectedEvent, setSelectedEvent] = useState<AnalyticsEventRow | null>(null);

  const loadEvents = async () => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from('analytics_events')
      .select('*')
      .eq('project_id', siteId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (typeFilter !== 'all') {
      query = query.eq('event_type', typeFilter as any);
    }
    if (deviceFilter !== 'all') {
      query = query.eq('device_category', deviceFilter as any);
    }


    const { data, error } = await query;
    if (!error && data) {
      setEvents(data as AnalyticsEventRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadEvents();
  }, [siteId, typeFilter, deviceFilter]);

  const filteredEvents = events.filter((ev) => {
    if (!searchPath) return true;
    return ev.path.toLowerCase().includes(searchPath.toLowerCase());
  });

  return (
    <AppShell role="admin">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Navigation & Header */}
        <div>
          <Link
            href={`/analytics/${siteId}`}
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] mb-3 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Project Telemetry
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-primary)] bg-[var(--color-primary-subtle)] px-2.5 py-0.5 rounded-full border border-[var(--color-primary-light)]">
                  Audit Telemetry Stream
                </span>
                <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> DPDP Act Safe Properties
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                Raw Events Explorer
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Granular incoming HTTP telemetry stream with privacy-safe property inspector.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />}
              onClick={loadEvents}
            >
              Refresh Stream
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              value={searchPath}
              onChange={(e) => setSearchPath(e.target.value)}
              placeholder="Filter by path (e.g. /pricing)..."
              className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg pl-10 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[var(--text-tertiary)] uppercase font-semibold">Event:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              >
                <option value="all">All Events</option>
                <option value="pageview">Pageviews</option>
                <option value="click">Clicks</option>
                <option value="heartbeat">Heartbeats</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[var(--text-tertiary)] uppercase font-semibold">Device:</span>
              <select
                value={deviceFilter}
                onChange={(e) => setDeviceFilter(e.target.value)}
                className="bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              >
                <option value="all">All Devices</option>
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobile</option>
                <option value="tablet">Tablet</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Ledger Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 text-center text-sm text-[var(--text-tertiary)]">
                Fetching event telemetry stream...
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Activity className="h-10 w-10 text-[var(--text-tertiary)] mx-auto" />
                <p className="text-sm font-medium text-[var(--text-secondary)]">No events match criteria</p>
                <p className="text-xs text-[var(--text-tertiary)] max-w-sm mx-auto">
                  {searchPath ? 'Try clearing your path search filter.' : 'Live events will appear as users interact with the client app.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border-hairline)] text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                    <tr>
                      <th className="py-3 px-6 font-medium">Type</th>
                      <th className="py-3 px-6 font-medium">Target Path / Title</th>
                      <th className="py-3 px-6 font-medium">Referrer</th>
                      <th className="py-3 px-6 font-medium">Device & Browser</th>
                      <th className="py-3 px-6 font-medium">Visitor Hash</th>
                      <th className="py-3 px-6 font-medium">Duration</th>
                      <th className="py-3 px-6 font-medium text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-hairline)]">
                    {filteredEvents.map((ev) => (
                      <tr
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className="hover:bg-[var(--bg-subtle)] transition cursor-pointer"
                      >
                        <td className="py-3 px-6">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                              ev.event_type === 'pageview'
                                ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                : ev.event_type === 'click'
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                : 'bg-[var(--bg-subtle)] text-[var(--text-tertiary)] border border-[var(--border-hairline)]'
                            }`}
                          >
                            {ev.event_type === 'pageview' && <Eye className="h-3 w-3" />}
                            {ev.event_type === 'click' && <MousePointerClick className="h-3 w-3" />}
                            {ev.event_type}
                          </span>
                        </td>
                        <td className="py-3 px-6 font-mono text-xs text-[var(--text-primary)] max-w-xs truncate">
                          <span className="font-semibold">{ev.path}</span>
                          {ev.element_text && (
                            <span className="text-[var(--text-tertiary)] ml-2 truncate block">
                              &ldquo;{ev.element_text}&rdquo;
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-6 text-xs text-[var(--text-tertiary)] truncate max-w-xs">
                          {ev.referrer || 'Direct'}
                        </td>
                        <td className="py-3 px-6 text-xs text-[var(--text-secondary)]">
                          <div className="flex items-center gap-1.5">
                            {ev.device_category === 'mobile' ? (
                              <Smartphone className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                            ) : (
                              <Monitor className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                            )}
                            <span>{ev.browser || 'Browser'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-6 font-mono text-xs text-[var(--text-tertiary)]">
                          {ev.visitor_hash ? `${ev.visitor_hash.slice(0, 8)}...` : '—'}
                        </td>
                        <td className="py-3 px-6 tabular-nums font-mono text-xs text-[var(--text-secondary)]">
                          {ev.duration_seconds}s
                        </td>
                        <td className="py-3 px-6 tabular-nums text-xs text-right text-[var(--text-tertiary)]">
                          {formatDate(ev.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal: Event Properties Inspector */}
        <Modal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title="Telemetry Event Property Inspector"
          description="DPDP Act compliant payload verification. No keystrokes or passwords recorded."
        >
          {selectedEvent && (
            <div className="space-y-4">
              <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800 max-h-96">
                <code>{JSON.stringify(selectedEvent, null, 2)}</code>
              </pre>

              <div className="flex justify-end pt-2 border-t border-[var(--border-hairline)]">
                <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AppShell>
  );
}
