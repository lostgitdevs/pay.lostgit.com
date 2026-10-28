'use client';

import React, { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from './button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  onConfirm?: () => void;
  confirmVariant?: 'primary' | 'danger';
  confirmLoading?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg';
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmLabel,
  onConfirm,
  confirmVariant = 'primary',
  confirmLoading = false,
  maxWidth = 'md',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClass = maxWidth === 'sm' ? 'max-w-sm' : maxWidth === 'lg' ? 'max-w-2xl' : 'max-w-md';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
    >
      <div
        className={`w-full ${widthClass} rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-canvas)] shadow-2xl overflow-hidden`}
      >
        {/* Header */}
        <div className="p-5 border-b border-[var(--border-subtle)] flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">{title}</h3>
            {description && <p className="text-xs text-[var(--text-secondary)] mt-1">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] transition focus-ring cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        {children && <div className="p-5 text-sm text-[var(--text-secondary)]">{children}</div>}

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-2)]/50 flex items-center justify-end gap-2.5">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={confirmLoading}>
            Cancel
          </Button>
          {confirmLabel && onConfirm && (
            <Button
              variant={confirmVariant}
              size="sm"
              onClick={onConfirm}
              loading={confirmLoading}
            >
              {confirmLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
