import React, { useState } from 'react';

export const Tooltip = ({
  children,
  content,
  position = 'top',
  className = '',
  containerClassName = '',
}) => {
  const [show, setShow] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const currentPosition = positions[position] || positions.top;

  return (
    <div
      className={`relative inline-block ${containerClassName}`}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          className={`absolute z-50 px-2 py-1 bg-surface-highest border border-black/10 
                     text-label-sm text-on-surface rounded shadow-modal whitespace-nowrap 
                     animate-fade-in ${currentPosition} ${className}`}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
