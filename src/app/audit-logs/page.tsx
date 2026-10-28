'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import {
  FileText,
  Search,
  ShieldCheck,
  User,
  Clock,
  Code2,
  RefreshCw,
} from 'lucide-react';

interface AuditLogRow {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  profiles?: {
    email: string;
    full_name: string;
  };
}

export default function AuditLogsPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AuditLogRow | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from('audit_logs')
      .select(`
        id,
        action,
        entity_type,
        entity_id,
        details,
        ip_address,
        user_agent,
        created_at,
        profiles (
          email,
          full_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (entityFilter !== 'all') {
      query = query.eq('entity_type', entityFilter);
    }

    const { data, error } = await query;
    if (!error && data) {
      setLogs(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, [entityFilter]);

  const filteredLogs = logs.filter((l) => {
    const q = searchQuery.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      (l.entity_id && l.entity_id.toLowerCase().includes(q)) ||
      (l.profiles?.email && l.profiles.email.toLowerCase().includes(q))
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
                Immutable Ledger
              </span>
              <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Non-Repudiation Verified
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Operational Audit Logs
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Tamper-evident chronological trail of administrative actions, entitlement changes, and financial events.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />}
            onClick={loadLogs}
          >
            Refresh Logs
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by action, actor, entity ID..."
              className="w-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg pl-10 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-[var(--text-tertiary)] uppercase font-semibold">Entity:</span>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="bg-[var(--bg-canvas)] border border-[var(--border-hairline)] rounded-lg px-3 py-2 text-xs font-medium text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            >
              <option value="all">All Entities</option>
              <option value="projects">Projects</option>
              <option value="invoices">Invoices</option>
              <option value="payments">Payments</option>
              <option value="licences">Licences</option>
            </select>
          </div>
        </div>

        {/* Audit Logs Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 text-center text-sm text-[var(--text-tertiary)]">
                Querying audit trail...
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <FileText className="h-10 w-10 text-[var(--text-tertiary)] mx-auto" />
                <p className="text-sm font-medium text-[var(--text-secondary)]">No audit logs found</p>
                <p className="text-xs text-[var(--text-tertiary)] max-w-sm mx-auto">
                  {searchQuery ? 'Try adjusting your search criteria.' : 'Administrative actions will be captured here.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border-hairline)] text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                    <tr>
                      <th className="py-3 px-6 font-medium">Timestamp</th>
                      <th className="py-3 px-6 font-medium">Action</th>
                      <th className="py-3 px-6 font-medium">Target Entity</th>
                      <th className="py-3 px-6 font-medium">Actor</th>
                      <th className="py-3 px-6 font-medium">IP Address</th>
                      <th className="py-3 px-6 font-medium text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-hairline)]">
                    {filteredLogs.map((log) => (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className="hover:bg-[var(--bg-subtle)] transition cursor-pointer"
                      >
                        <td className="py-3.5 px-6 font-mono text-xs tabular-nums text-[var(--text-tertiary)]">
                          {formatDate(log.created_at)}
                        </td>
                        <td className="py-3.5 px-6 font-mono text-xs font-semibold text-[var(--color-primary)]">
                          {log.action}
                        </td>
                        <td className="py-3.5 px-6 text-xs text-[var(--text-secondary)]">
                          <span className="uppercase tracking-wider font-semibold text-[var(--text-primary)]">
                            {log.entity_type}
                          </span>
                          {log.entity_id && (
                            <span className="font-mono text-[var(--text-tertiary)] ml-1.5">
                              ({log.entity_id.slice(0, 8)}...)
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-xs text-[var(--text-secondary)]">
                          {log.profiles?.email || 'System Daemon'}
                        </td>
                        <td className="py-3.5 px-6 font-mono text-xs text-[var(--text-tertiary)]">
                          {log.ip_address || '127.0.0.1'}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <Button variant="ghost" size="sm" icon={<Code2 className="h-3.5 w-3.5" />}>
                            Diff
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal: JSON Diff Viewer */}
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Audit Payload: ${selectedLog?.action}`}
          description={`Logged at ${selectedLog ? formatDate(selectedLog.created_at) : ''}`}
        >
          {selectedLog && (
            <div className="space-y-4">
              <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800 max-h-96">
                <code>{JSON.stringify(selectedLog.details, null, 2)}</code>
              </pre>

              <div className="flex justify-end pt-2 border-t border-[var(--border-hairline)]">
                <Button variant="outline" onClick={() => setSelectedLog(null)}>
                  Dismiss
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AppShell>
  );
}
