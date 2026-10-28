'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '../theme-provider';
import { Card, CardHeader, CardContent } from '../ui/card';

export interface TrafficPoint {
  date: string;
  pageviews: number;
  visitors: number;
}

export function TrafficBarChart({
  data,
  title = 'Traffic Velocity',
  description = 'Pageviews vs. unique visitors',
}: {
  data: TrafficPoint[];
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
            <p>No traffic telemetry recorded in the selected period</p>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={strokeColor} />
                <XAxis
                  dataKey="date"
                  stroke={textColor}
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: strokeColor }}
                />
                <YAxis stroke={textColor} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: isDark ? '#F4F5F8' : '#171923',
                  }}
                />
                <Bar dataKey="pageviews" fill="#6D5EF5" radius={[4, 4, 0, 0]} name="Pageviews" />
                <Bar dataKey="visitors" fill="#10B981" radius={[4, 4, 0, 0]} name="Visitors" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
