import React from 'react';

export const ProgressBar = ({
  value = 0,
  max = 100,
  variant = 'cyan', // cyan, emerald, primary
  showLabel = false,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const variants = {
    cyan: 'bg-cyan shadow-glow-cyan',
    emerald: 'bg-emerald shadow-glow-emerald',
    primary: 'bg-primary-container shadow-glow',
  };

  const activeColor = variants[variant] || variants.cyan;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-label-sm text-on-surface-var/80">
          <span>Progress</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-surface-lowest border border-black/[0.06] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${activeColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
