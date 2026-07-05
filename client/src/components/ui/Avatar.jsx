import React, { useState, useEffect } from 'react';

export const Avatar = ({
  name = '',
  src = '',
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  // Reset error state if src changes
  useEffect(() => {
    setImageError(false);
  }, [src]);

  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-body-sm',
    lg: 'w-12 h-12 text-body-md',
    xl: 'w-16 h-16 text-headline-sm',
  };

  const currentSize = sizes[size] || sizes.md;

  const getInitials = (userName) => {
    if (!userName) return 'U';
    // Handle both space-separated and dot-separated initials
    const separator = userName.includes(' ') ? ' ' : userName.includes('.') ? '.' : '';
    if (!separator) {
      return userName.slice(0, 2).toUpperCase();
    }
    return userName
      .split(separator)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getBgColor = (userName) => {
    if (!userName) return 'bg-primary/20 text-primary';
    const code = userName.charCodeAt(0) % 5;
    const colors = [
      'bg-primary/20 text-primary',
      'bg-cyan/20 text-cyan',
      'bg-emerald/20 text-emerald',
      'bg-tertiary/20 text-tertiary',
      'bg-secondary/20 text-secondary',
    ];
    return colors[code];
  };

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        referrerPolicy="no-referrer"
        onError={() => setImageError(true)}
        className={`rounded-full object-cover border border-black/10 ${currentSize} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full font-semibold flex items-center justify-center border border-black/[0.06]
                 ${getBgColor(name)} ${currentSize} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
