import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, MinusCircle, ShieldCheck, ShieldAlert } from 'lucide-react';

export type StatusType =
  | 'active'
  | 'paid'
  | 'pending'
  | 'partially_paid'
  | 'grace_period'
  | 'suspended'
  | 'overdue'
  | 'failed'
  | 'cancelled'
  | 'draft'
  | 'healthy'
  | 'degraded'
  | 'disconnected';

interface BadgeProps {
  status: StatusType | string;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusBadge({ status, label, size = 'md', className = '' }: BadgeProps) {
  const normalized = (status || 'draft').toLowerCase().replace(/\s+/g, '_');

  let config = {
    bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    icon: <MinusCircle className="h-3 w-3 shrink-0" />,
    text: label || status,
  };

  switch (normalized) {
    case 'active':
    case 'paid':
    case 'healthy':
      config = {
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 dark:text-emerald-300',
        icon: <CheckCircle2 className="h-3 w-3 shrink-0" />,
        text: label || (normalized === 'active' ? 'Active' : normalized === 'paid' ? 'Paid' : 'Healthy'),
      };
      break;

    case 'pending':
    case 'partially_paid':
      config = {
        bg: 'bg-amber-500/10 text-amber-500 border-amber-500/25 dark:text-amber-300',
        icon: <Clock className="h-3 w-3 shrink-0" />,
        text: label || (normalized === 'partially_paid' ? 'Partially Paid' : 'Pending'),
      };
      break;

    case 'grace_period':
      config = {
        bg: 'bg-amber-500/15 text-amber-500 border-amber-500/40 dark:text-amber-200 animate-pulse',
        icon: <Clock className="h-3 w-3 shrink-0" />,
        text: label || 'Grace Period',
      };
      break;

    case 'degraded':
      config = {
        bg: 'bg-amber-500/10 text-amber-500 border-amber-500/25',
        icon: <AlertTriangle className="h-3 w-3 shrink-0" />,
        text: label || 'Degraded',
      };
      break;

    case 'suspended':
    case 'overdue':
    case 'failed':
    case 'disconnected':
      config = {
        bg: 'bg-rose-500/10 text-rose-500 border-rose-500/25 dark:text-rose-300',
        icon: normalized === 'suspended' ? <ShieldAlert className="h-3 w-3 shrink-0" /> : <XCircle className="h-3 w-3 shrink-0" />,
        text: label || (normalized === 'suspended' ? 'Suspended' : normalized === 'overdue' ? 'Overdue' : normalized === 'failed' ? 'Failed' : 'Disconnected'),
      };
      break;

    case 'cancelled':
    case 'draft':
    default:
      config = {
        bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        icon: <MinusCircle className="h-3 w-3 shrink-0" />,
        text: label || (normalized === 'cancelled' ? 'Cancelled' : 'Draft'),
      };
      break;
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px] gap-1' : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border tracking-wide uppercase ${config.bg} ${sizeClasses} ${className}`}
    >
      {config.icon}
      <span>{config.text}</span>
    </span>
  );
}
