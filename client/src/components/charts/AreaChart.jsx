import React from 'react';
import {
  AreaChart as ReAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-lowest border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-3 shadow-modal">
        <p className="text-label-sm text-on-surface-var/60 mb-1 font-mono">{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} className="text-body-sm font-bold flex items-center gap-2" style={{ color: entry.color }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const AreaChart = ({ data = [], height = 300 }) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <ReAreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(var(--color-accent))" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="rgb(var(--color-accent))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--color-on-surface), 0.05)" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="rgba(var(--color-on-surface), 0.4)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis
            stroke="rgba(var(--color-on-surface), 0.4)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            name="Created"
            type="monotone"
            dataKey="created"
            stroke="rgb(var(--color-accent))"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCreated)"
          />
          <Area
            name="Completed"
            type="monotone"
            dataKey="completed"
            stroke="#10B981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCompleted)"
          />
        </ReAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AreaChart;
