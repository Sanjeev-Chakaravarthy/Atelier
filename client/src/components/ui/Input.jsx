import React from 'react';

export const Input = React.forwardRef(({
  className = '',
  label,
  error,
  type = 'text',
  leftIcon,
  rightIcon,
  required,
  ...props
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-var/60 flex items-center gap-0.5">
          {label}
          {required && <span className="text-error">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-on-surface-var/60 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`input-base ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${
            error ? 'border-error/50 focus:border-error/80 focus:shadow-[0_0_0_3px_rgba(255,180,171,0.2)]' : ''
          } ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 text-on-surface-var/60 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <span className="text-body-sm text-error/90 pl-1 animate-fade-in">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
