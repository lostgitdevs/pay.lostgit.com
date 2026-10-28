import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
}

export function Card({ children, className = '', elevated = false, ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-1)] transition-colors ${
        elevated ? 'shadow-elegant bg-[var(--bg-surface-2)]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  description,
  action,
  icon,
  className = '',
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  const sub = subtitle || description;
  return (
    <div className={`p-5 border-b border-[var(--border-subtle)] flex items-center justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="h-9 w-9 rounded-lg bg-[var(--accent-tint)] text-[#6D5EF5] dark:text-[#8B80FF] flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">{title}</h3>
          {sub && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{sub}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}


export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-2)]/50 rounded-b-xl ${className}`}>
      {children}
    </div>
  );
}
