import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-surface-lowest border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-2.5 shadow-modal">
        <p className="text-body-sm font-bold flex items-center gap-2" style={{ color: payload[0].payload.fill }}>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
          {data.name}: {data.value}
        </p>
      </div>
    );
  }
  return null;
};

export const DonutChart = ({ data = [], height = 240 }) => {
  const COLORS = ['rgb(var(--color-accent))', '#06B6D4', '#F59E0B', '#EF4444', '#10B981'];

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <PieChart>
          <Tooltip content={<CustomTooltip />} />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                stroke="rgb(var(--color-surface-lowest))" 
                strokeWidth={2.5} 
              />
            ))}
          </Pie>
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span className="text-label-sm text-on-surface-var/80 font-medium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DonutChart;
