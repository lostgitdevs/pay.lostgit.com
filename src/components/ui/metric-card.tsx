import React from 'react';
import { TrendingUp, TrendingDown, Minus, Info, AlertTriangle } from 'lucide-react';

export interface MetricCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  subvalue?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral' | 'warning' | string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
    label?: string;
  };
  tooltip?: string;
  loading?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  subvalue,
  change,
  changeType = 'neutral',
  icon,
  trend,
  tooltip,
  loading = false,
  isLoading = false,
  className = '',
}: MetricCardProps) {
  const isSpinning = loading || isLoading;
  const displaySubtitle = subvalue || subtitle;

  const resolvedTrend = trend || (change ? {
    value: change,
    isPositive: changeType === 'positive',
    isNeutral: changeType === 'neutral',
    label: displaySubtitle,
  } : undefined);

  return (
    <div
      className={`rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-1)] p-5 relative overflow-hidden transition-all duration-150 hover:border-[var(--border-strong)] ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">{title}</span>
          {tooltip && (
            <span title={tooltip} className="cursor-help text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
              <Info className="h-3 w-3" />
            </span>
          )}
        </div>
        {icon && (
          <div className="h-8 w-8 rounded-lg bg-[var(--bg-surface-2)] text-[var(--text-secondary)] flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
      </div>

      {isSpinning ? (
        <div className="space-y-2">
          <div className="h-8 w-32 rounded bg-[var(--bg-surface-2)] animate-pulse" />
          <div className="h-4 w-24 rounded bg-[var(--bg-surface-2)] animate-pulse" />
        </div>
      ) : (
        <>
          <div className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tabular-nums tracking-tight">
            {value}
          </div>

          <div className="mt-2 flex items-center gap-2 text-xs">
            {resolvedTrend ? (
              <span
                className={`inline-flex items-center gap-0.5 font-semibold tabular-nums px-1.5 py-0.5 rounded ${
                  changeType === 'warning'
                    ? 'text-amber-500 bg-amber-500/10'
                    : resolvedTrend.isNeutral
                    ? 'text-[var(--text-muted)] bg-[var(--bg-surface-2)]'
                    : resolvedTrend.isPositive
                    ? 'text-emerald-500 bg-emerald-500/10'
                    : 'text-rose-500 bg-rose-500/10'
                }`}
              >
                {changeType === 'warning' ? (
                  <AlertTriangle className="h-3 w-3" />
                ) : resolvedTrend.isNeutral ? (
                  <Minus className="h-3 w-3" />
                ) : resolvedTrend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{resolvedTrend.value}</span>
              </span>
            ) : null}
            {displaySubtitle && (
              <span className="text-[var(--text-muted)]">{displaySubtitle}</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
