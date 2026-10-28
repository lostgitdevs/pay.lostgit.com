'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useTheme } from '../theme-provider';
import { Card, CardHeader, CardContent } from '../ui/card';

interface DataPoint {
  date: string;
  collected: number; // in rupees
  invoiced: number; // in rupees
}

export function RevenueTimelineChart({
  data,
  title = 'Revenue Velocity (INR)',
  description = 'Monthly invoiced vs. realized cash collected',
}: {
  data: DataPoint[];
  title?: string;
  description?: string;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const strokeColor = isDark ? '#2A2F3B' : '#E2E5EC';
  const textColor = isDark ? '#A5ADBA' : '#667085';
  const tooltipBg = isDark ? '#171A22' : '#FFFFFF';
  const tooltipBorder = isDark ? '#2A2F3B' : '#E2E5EC';

  return (
    <Card>
      {title && <CardHeader title={title} description={description} />}
      <CardContent>
        {!data || data.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-xs text-[var(--text-tertiary)] border border-dashed border-[var(--border-hairline)] rounded-xl">
            <p>No billing transactions in the selected period</p>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorInvoiced" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6D5EF5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6D5EF5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke={textColor}
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: strokeColor }}
                />
                <YAxis
                  stroke={textColor}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: isDark ? '#F4F5F8' : '#171923',
                  }}
                  formatter={(val: any, name: any) => [
                    formatCurrency(Number(val) * 100, 'INR'),
                    name === 'collected' ? 'Realized (Paid)' : 'Invoiced',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="invoiced"
                  stroke="#6D5EF5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorInvoiced)"
                />
                <Area
                  type="monotone"
                  dataKey="collected"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCollected)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
