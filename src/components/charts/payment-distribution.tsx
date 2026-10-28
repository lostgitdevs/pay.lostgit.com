'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '../theme-provider';
import { Card, CardHeader, CardContent } from '../ui/card';

interface Slice {
  name: string;
  value: number;
  color: string;
}

export function PaymentStatusDistribution({
  data,
  title = 'Settlement Distribution',
  description = 'Realized payments vs. pending and overdue balances',
}: {
  data: Slice[];
  title?: string;
  description?: string;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const tooltipBg = isDark ? '#171A22' : '#FFFFFF';
  const tooltipBorder = isDark ? '#2A2F3B' : '#E2E5EC';

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card>
      {title && <CardHeader title={title} description={description} />}
      <CardContent>
        {!data || total === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-xs text-[var(--text-tertiary)] border border-dashed border-[var(--border-hairline)] rounded-xl">
            <p>No distribution data available</p>
          </div>
        ) : (
          <div className="h-72 w-full flex flex-col items-center justify-center">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      borderColor: tooltipBorder,
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: isDark ? '#F4F5F8' : '#171923',
                    }}
                  />
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    stroke={isDark ? '#171A22' : '#FFFFFF'}
                    strokeWidth={2}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
              {data.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}:</span>
                  <span className="font-semibold text-[var(--text-primary)] tabular-nums">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const PaymentDistributionChart = PaymentStatusDistribution;
