'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/copy-button';
import { Modal } from '@/components/ui/modal';
import {
  Key,
  ArrowLeft,
  RotateCcw,
  ShieldAlert,
  Globe,
  Building2,
  FolderGit2,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function LicenceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const licenceId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [licence, setLicence] = useState<any>(null);
  const [revealed, setRevealed] = useState(false);

  // Rotate Key Modal
  const [rotateModalOpen, setRotateModalOpen] = useState(false);
  const [rotating, setRotating] = useState(false);

  // Revoke Key Modal
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    async function loadLicence() {
      if (!licenceId) return;
      const supabase = createClient();

      const { data, error } = await supabase
        .from('licences')
        .select(`
          *,
          projects (
            id,
            name
          ),
          clients (
            id,
            business_name
          )
        `)
        .eq('id', licenceId)
        .single();

      if (!error && data) {
        setLicence(data);
      }
      setLoading(false);
    }

    loadLicence();
  }, [licenceId]);

  const handleRotateKey = async () => {
    setRotating(true);
    const supabase = createClient();

    const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const newKey = `lgp_live_${randomHex}`;

    // Update current licence key
    const { error } = await supabase
      .from('licences')
      .update({ licence_key: newKey, status: 'active' })
      .eq('id', licence.id);

    if (!error) {
      // Also update project licence_key
      if (licence.project_id) {
        await supabase
          .from('projects')
          .update({ licence_key: newKey })
          .eq('id', licence.project_id);
      }

      // Record audit log
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('audit_logs').insert([
        {
          user_id: user?.id || null,
          action: 'licence_rotated',
          entity_type: 'licences',
          entity_id: licence.id,
          details: { old_key: licence.licence_key.slice(0, 12), new_key: newKey.slice(0, 12) },
        },
      ]);

      setLicence({ ...licence, licence_key: newKey, status: 'active' });
      setRotateModalOpen(false);
    }

    setRotating(false);
  };

  const handleRevokeKey = async () => {
    setRevoking(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('licences')
      .update({ status: 'revoked' })
      .eq('id', licence.id);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('audit_logs').insert([
        {
          user_id: user?.id || null,
          action: 'licence_revoked',
          entity_type: 'licences',
          entity_id: licence.id,
          details: { key: licence.licence_key.slice(0, 12) },
        },
      ]);

      setLicence({ ...licence, status: 'revoked' });
      setRevokeModalOpen(false);
    }

    setRevoking(false);
  };

  if (loading) {
    return (
      <AppShell role="admin">
        <div className="py-24 text-center text-sm text-[var(--text-tertiary)] animate-pulse">
          Loading licence key details...
        </div>
      </AppShell>
    );
  }

  if (!licence) {
    return (
      <AppShell role="admin">
        <div className="py-24 text-center space-y-4">
          <p className="text-lg font-semibold text-[var(--text-primary)]">Licence not found</p>
          <Link href="/licences">
            <Button variant="outline" icon={<ArrowLeft className="h-4 w-4" />}>
              Back to Licences
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const displayKey = revealed
    ? licence.licence_key
    : `${licence.licence_key.slice(0, 9)}••••••••••••••••••••••••`;

  return (
    <AppShell role="admin">
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Navigation & Header */}
        <div>
          <Link
            href="/licences"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] mb-3 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Licences Ledger
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                  Licence Enforcement
                </h1>
                <StatusBadge status={licence.status} />
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Project: {licence.projects?.name} &bull; Client: {licence.clients?.business_name}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<RotateCcw className="h-3.5 w-3.5" />}
                onClick={() => setRotateModalOpen(true)}
              >
                Rotate Key
              </Button>
              {licence.status !== 'revoked' && (
                <Button
                  variant="danger"
                  size="sm"
                  icon={<ShieldAlert className="h-3.5 w-3.5" />}
                  onClick={() => setRevokeModalOpen(true)}
                >
                  Revoke Key
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Key Card */}
        <div className="border border-[var(--border-hairline)] bg-[var(--surface-1)] rounded-2xl p-6">
          <span className="text-xs uppercase font-semibold text-[var(--text-tertiary)]">
            Cryptographic Runtime Key
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <div className="flex items-center gap-3 font-mono text-sm text-[var(--text-primary)] font-bold">
              <span>{displayKey}</span>
              <button
                onClick={() => setRevealed(!revealed)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition"
              >
                {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <CopyButton text={licence.licence_key} label="Copy Key" copiedLabel="Key Copied!" />
          </div>
        </div>

        {/* Domain Enforcement & Expiry Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Domain Boundaries" />
            <CardContent className="space-y-3 text-xs">
              <p className="text-[var(--text-secondary)]">
                The LostGit Pay runtime verify endpoint checks the requesting client&apos;s HTTP Origin against these allowlisted domains.
              </p>

              {licence.allowed_domains && licence.allowed_domains.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {licence.allowed_domains.map((dom: string, i: number) => (
                    <span
                      key={i}
                      className="font-mono bg-[var(--bg-subtle)] border border-[var(--border-hairline)] px-2 py-1 rounded text-xs text-[var(--text-primary)]"
                    >
                      {dom}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="italic text-[var(--text-tertiary)] pt-2">No domain limits specified (wildcard origin allowed).</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Temporal Validity" />
            <CardContent className="space-y-3 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[var(--border-hairline)]">
                <span className="text-[var(--text-secondary)]">Valid Until:</span>
                <span className="text-[var(--text-primary)]">
                  {licence.valid_until ? formatDate(licence.valid_until) : 'Indefinite / Lifetime'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border-hairline)]">
                <span className="text-[var(--text-secondary)]">Last Pinged:</span>
                <span className="text-[var(--text-primary)]">
                  {licence.last_checked_at ? formatDate(licence.last_checked_at) : 'Never checked'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[var(--text-secondary)]">Created Date:</span>
                <span className="text-[var(--text-primary)]">{formatDate(licence.created_at)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal: Rotate Key */}
        <Modal
          isOpen={rotateModalOpen}
          onClose={() => setRotateModalOpen(false)}
          title="Rotate Runtime Licence Key"
          description="A new key will be generated immediately. The client will need to update their runtime environment variable or script tag."
        >
          <div className="space-y-4">
            <p className="text-xs text-[var(--text-secondary)]">
              Are you sure you want to rotate this licence key? Any client instances using the old key will fail verification on their next entitlement probe.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-hairline)]">
              <Button variant="outline" onClick={() => setRotateModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" isLoading={rotating} onClick={handleRotateKey}>
                Generate New Key
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal: Revoke Key */}
        <Modal
          isOpen={revokeModalOpen}
          onClose={() => setRevokeModalOpen(false)}
          title="Revoke Licence Key Access"
          description="Immediately suspend entitlement for this key. This action is irreversible."
        >
          <div className="space-y-4">
            <p className="text-xs text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              Warning: Revoking this key will cause the client application to fail entitlement verification and present a suspended notice to their end users.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-hairline)]">
              <Button variant="outline" onClick={() => setRevokeModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" isLoading={revoking} onClick={handleRevokeKey}>
                Revoke Permanently
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}
