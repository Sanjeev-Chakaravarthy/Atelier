import React from 'react';

export const Skeleton = ({
  className = '',
  variant = 'text', // text, circle, rect
  ...props
}) => {
  const baseClass = 'skeleton';
  
  const variants = {
    text: 'h-4 w-full',
    circle: 'h-10 w-10 rounded-full',
    rect: 'h-24 w-full rounded-md',
  };

  const currentClass = variants[variant] || '';

  return (
    <div
      className={`${baseClass} ${currentClass} ${className}`}
      {...props}
    />
  );
};

export default Skeleton;
