import React from 'react';

export const Badge = ({
  children,
  className = '',
  variant = 'default', // status, priority variants
  ...props
}) => {
  const badgeClasses = {
    // priorities
    low: 'priority-low',
    medium: 'priority-medium',
    high: 'priority-high',
    urgent: 'priority-urgent',
    
    // statuses
    todo: 'status-todo',
    'in-progress': 'status-in-progress',
    review: 'status-review',
    done: 'status-done',
    
    // defaults
    default: 'badge bg-surface-high border border-black/10 text-on-surface-var',
    primary: 'badge bg-primary/10 text-primary border border-primary/20',
    cyan: 'badge bg-cyan/10 text-cyan border border-cyan/20',
    emerald: 'badge bg-emerald/10 text-emerald border border-emerald/20',
    error: 'badge bg-error/10 text-error border border-error/20',
  };

  const currentClass = badgeClasses[variant] || badgeClasses.default;

  return (
    <span className={`${currentClass} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;
