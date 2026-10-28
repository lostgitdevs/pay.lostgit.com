'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CopyButton({
  text,
  label = 'Copy',
  copiedLabel = 'Copied',
  className = '',
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`Copy ${label} to clipboard`}
      aria-label={`Copy ${label}`}
      className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition focus-ring cursor-pointer ${className}`}
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      <span>{copied ? copiedLabel : label}</span>
    </button>

  );
}
