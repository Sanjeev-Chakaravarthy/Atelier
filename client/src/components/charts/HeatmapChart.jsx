import React from 'react';
import Tooltip from '../ui/Tooltip';

export const HeatmapChart = ({ data = {} }) => {
  // Generates past 52 weeks of dates
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    // Offset to start at a Sunday 52 weeks ago
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    for (let i = 0; i < 365 + dayOfWeek; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const dates = generateDates();

  const getAlpha = (count) => {
    if (count === 1) return 0.2;
    if (count === 2) return 0.45;
    if (count === 3) return 0.7;
    return 1.0;
  };

  const getStyle = (count) => {
    if (!count) return {};
    const alpha = getAlpha(count);
    const accent = 'var(--color-accent)';
    return {
      backgroundColor: `rgba(${accent}, ${alpha})`,
      borderColor: `rgba(${accent}, ${alpha + 0.15})`,
    };
  };

  const getClassName = (count) => {
    if (!count) {
      return 'bg-surface-low/80 dark:bg-surface-low/30 border border-black/[0.04] dark:border-white/[0.04]';
    }
    let base = 'border transition-all hover:scale-125 hover:z-10';
    if (count >= 4) {
      base += ' shadow-glow';
    }
    return base;
  };

  // Group dates by week (7 rows per week column)
  const columns = [];
  let currentWeek = [];

  dates.forEach((date, index) => {
    currentWeek.push(date);
    if (currentWeek.length === 7 || index === dates.length - 1) {
      columns.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-2">
        <div className="flex gap-[3px]">
          {columns.map((week, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-[3px]">
              {week.map((date, rowIdx) => {
                const dateStr = date.toISOString().split('T')[0];
                const count = data[dateStr] || 0;
                const formattedDate = date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <Tooltip
                    key={rowIdx}
                    content={`${count} mission${count === 1 ? '' : 's'} completed on ${formattedDate}`}
                    position="top"
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-[2px] cursor-pointer ${getClassName(count)}`}
                      style={getStyle(count)}
                    />
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-1.5 justify-end text-[10px] text-on-surface-var/50 font-mono">
        <span>Less</span>
        <div className="w-3 h-3 rounded-[2px] bg-surface-low/80 dark:bg-surface-low/30 border border-black/[0.04] dark:border-white/[0.04]" />
        <div className="w-3 h-3 rounded-[2px] border" style={{ backgroundColor: 'rgba(var(--color-accent), 0.2)', borderColor: 'rgba(var(--color-accent), 0.35)' }} />
        <div className="w-3 h-3 rounded-[2px] border" style={{ backgroundColor: 'rgba(var(--color-accent), 0.45)', borderColor: 'rgba(var(--color-accent), 0.6)' }} />
        <div className="w-3 h-3 rounded-[2px] border" style={{ backgroundColor: 'rgba(var(--color-accent), 0.7)', borderColor: 'rgba(var(--color-accent), 0.85)' }} />
        <div className="w-3 h-3 rounded-[2px] border shadow-glow" style={{ backgroundColor: 'rgb(var(--color-accent))', borderColor: 'rgb(var(--color-accent))' }} />
        <span>More</span>
      </div>
    </div>
  );
};

export default HeatmapChart;
