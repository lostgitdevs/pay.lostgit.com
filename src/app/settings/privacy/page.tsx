'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Shield,
  ShieldCheck,
  Lock,
  RefreshCw,
  Trash2,
  Download,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function PrivacySettingsPage() {
  const [retentionDays, setRetentionDays] = useState(90);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSaveRetention = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 500);
  };

  return (
    <AppShell role="admin">
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Statutory Compliance
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              DPDP Act 2023 & Privacy Architecture
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Privacy-by-design guarantees, automated event retention schedules, and data fiduciary compliance.
            </p>
          </div>
        </div>

        {success && (
          <div className="p-3 text-xs rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Data retention policy successfully updated.
          </div>
        )}

        {/* DPDP Compliance Guarantees */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-[var(--border-hairline)] bg-[var(--surface-1)] rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-500">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Cookie-Free SDK</h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Zero cookies, zero persistent web storage, and zero fingerprinting. Complies unconditionally with consent guidelines.
            </p>
          </div>

          <div className="border border-[var(--border-hairline)] bg-[var(--surface-1)] rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-[var(--color-primary)]">
              <RefreshCw className="h-5 w-5" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Daily Salt Rotation</h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Visitor hashes are calculated using a rolling 24-hour cryptographic salt. No longitudinal cross-site tracking is mathematically possible.
            </p>
          </div>

          <div className="border border-[var(--border-hairline)] bg-[var(--surface-1)] rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-blue-500">
              <Lock className="h-5 w-5" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Zero PII Ingestion</h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Input field values, form keystrokes, and passwords are unconditionally rejected and stripped prior to dispatch.
            </p>
          </div>
        </div>

        {/* Automated Data Retention Policy */}
        <Card>
          <CardHeader
            title="Telemetry Retention & Auto-Pruning Schedule"
            description="Automated cron jobs permanently purge aged event records in accordance with minimization principles"
          />
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                Event Retention Window
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[30, 90, 180, 365].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setRetentionDays(days)}
                    className={`py-3 px-4 rounded-xl border text-xs font-medium transition cursor-pointer text-center ${
                      retentionDays === days
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-subtle)] text-[var(--color-primary)] font-bold'
                        : 'border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:border-[var(--text-tertiary)]'
                    }`}
                  >
                    <div className="text-lg font-mono">{days} Days</div>
                    <div className="text-[11px] opacity-80 mt-0.5">
                      {days === 30 ? 'High Minimization' : days === 90 ? 'Recommended' : 'Extended Audit'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border-hairline)] flex justify-end">
              <Button variant="primary" isLoading={saving} onClick={handleSaveRetention}>
                Save Retention Policy
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Subject Rights (DPDP Section 11-13) */}
        <Card>
          <CardHeader
            title="Data Subject Rights (India DPDP Act § 11–13)"
            description="Exercise data principal rights including access, rectification, portability, and erasure"
          />
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
              <div>
                <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                  Right to Data Portability
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Export structured, machine-readable JSON archive of all telemetry and contract billing records.
                </p>
              </div>
              <Button variant="outline" size="sm" icon={<Download className="h-3.5 w-3.5" />}>
                Export Archive
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
              <div>
                <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                  Right to Erasure (&ldquo;Right to be Forgotten&rdquo;)
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Permanently purge and zero-out all telemetry events associated with a client site ID.
                </p>
              </div>
              <Button variant="danger" size="sm" icon={<Trash2 className="h-3.5 w-3.5" />}>
                Purge Site Events
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
